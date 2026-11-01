const searchBtn = document.querySelector('#search-btn')
const searchIpt = document.querySelector('#search-input')
const searchResult = document.querySelector('#search-result')
const searchClearBtn = document.querySelector('#search-clear')
const searchMask = document.querySelector('#search-mask')

const MAX_RESULTS = 30
const SNIPPET_WORDS = 24

let searchStatus = 0
let searchUrl = ''
let searchDataPromise = null

function showSearchDialog() {
  if (searchStatus) return

  // The open state lives on the mask so CSS can own the enter transition;
  // see `@starting-style` in _partials/search.styl.
  searchMask.classList.add('is-open')
  document.body.style.overflow = 'hidden'
  searchIpt.focus()
  searchStatus = 1
  // Warm the index only once the dialog is opened; pages that never search
  // no longer download search.json on load.
  fetchSearchData().catch(() => {})
}

function closeSearchDialog() {
  if (!searchStatus) return

  searchMask.classList.remove('is-open')
  document.body.style.overflow = ''
  searchIpt.value = ''
  clearResult()
  searchStatus = 0
  if (searchBtn) searchBtn.focus()
}

function searchInitialize(url) {
  if (!searchMask || !searchIpt || !searchResult) return

  searchUrl = url
  if (searchBtn) searchBtn.style.display = 'flex'

  const inputHandler = debounce(handleInput, 200)

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      if (searchStatus) closeSearchDialog()
      else showSearchDialog()
    }
    if (e.key === 'Escape') closeSearchDialog()
  })

  if (searchBtn) {
    searchBtn.addEventListener('click', showSearchDialog)
    searchBtn.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return
      e.preventDefault()
      showSearchDialog()
    })
  }

  if (searchClearBtn) {
    const clear = () => {
      searchIpt.value = ''
      clearResult()
      searchIpt.focus()
    }
    searchClearBtn.addEventListener('click', clear)
    searchClearBtn.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return
      e.preventDefault()
      clear()
    })
  }

  searchMask.addEventListener('click', e => {
    if (e.target !== searchMask) return
    closeSearchDialog()
  }, true)

  searchIpt.addEventListener('input', inputHandler)
}

function fetchSearchData() {
  if (!searchDataPromise) {
    searchDataPromise = fetch(searchUrl)
      .then(res => {
        if (!res.ok) throw new Error(`search.json ${res.status}`)
        return res.json()
      })
      .catch(err => {
        searchDataPromise = null
        throw err
      })
  }
  return searchDataPromise
}

async function handleInput() {
  const value = searchIpt.value.trim()
  if (!value) return clearResult()

  let data
  try {
    data = await fetchSearchData()
  } catch (error) {
    searchResult.innerHTML = '<div class="search-result-empty">搜索索引加载失败，请刷新重试</div>'
    return
  }

  // The input may have changed while the index was loading.
  if (searchIpt.value.trim() !== value) return

  const keywords = [...new Set(value.toLowerCase().split(/[\s-]+/).filter(Boolean))]
  renderSearchResult(search(data, keywords), searchResult)
}

function clearResult() {
  searchResult.innerHTML = ''
}

function search(data, keywords) {
  const result = []

  for (const post of data) {
    if (!post.content) continue

    const title = (post.title || 'Untitled').trim()
    const content = post.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    const loweredTitle = title.toLowerCase()
    const loweredContent = content.toLowerCase()

    let hit = -1
    for (const keyword of keywords) {
      const titleIndex = loweredTitle.indexOf(keyword)
      const contentIndex = loweredContent.indexOf(keyword)
      if (titleIndex < 0 && contentIndex < 0) continue
      if (hit < 0) hit = contentIndex >= 0 ? contentIndex : 0
    }

    if (hit < 0) continue

    result.push({ url: post.url, title, snippet: snippetAt(hit, content, keywords) })
    if (result.length >= MAX_RESULTS) break
  }

  return result
}

function renderSearchResult(result, el) {
  el.innerHTML = ''

  if (!result || result.length === 0) {
    el.innerHTML = '<div class="search-result-empty">无结果</div>'
    return
  }

  const list = document.createDocumentFragment()

  result.forEach(item => {
    const link = document.createElement('a')
    link.className = 'search-result-item'
    link.href = item.url

    const title = document.createElement('div')
    title.className = 'search-result__head'
    title.textContent = item.title

    const body = document.createElement('div')
    body.className = 'search-result__body'
    body.innerHTML = item.snippet

    link.append(title, body)
    list.append(link)
  })

  el.appendChild(list)
}

function wordRanges(content) {
  const ranges = []
  const reg = /[\u4e00-\u9fa5]|\w+/g
  let match

  while ((match = reg.exec(content)) !== null) {
    ranges.push([match.index, match.index + match[0].length])
  }

  return ranges
}

function snippetAt(index, content, keywords, wordLen = SNIPPET_WORDS) {
  const ranges = wordRanges(content)
  if (ranges.length === 0) return highlight(content.slice(0, 100), keywords)

  const found = ranges.findIndex(range => range[0] > index)
  const center = found === -1 ? ranges.length - 1 : Math.max(found - 1, 0)
  const start = ranges[Math.max(center - 8, 0)][0]
  const end = ranges[Math.min(center + wordLen, ranges.length - 1)][1]

  return (start > 0 ? '…' : '') +
    highlight(content.slice(start, end), keywords) +
    (end < content.length ? '…' : '')
}

function highlight(text, keywords) {
  const escaped = escapeHtml(text)
  if (keywords.length === 0) return escaped

  const pattern = new RegExp(`(${keywords.map(escapeRegExp).join('|')})`, 'ig')
  return escaped.replace(pattern, '<span class="search-keyword">$1</span>')
}

function escapeHtml(text) {
  return text.replace(/[&<>"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }[char]))
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function debounce(fn, time = 200) {
  let timer = null

  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), time)
  }
}
