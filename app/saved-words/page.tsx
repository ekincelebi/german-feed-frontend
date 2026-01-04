'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bookmark, X, Folder, FolderOpen, Plus, ChevronDown, ChevronUp, Trash2, Edit2, FolderX } from 'lucide-react'

interface SavedWord {
  id: string
  word: string
  meaning: string
  grammar: string
  example: string
  articleId: string
  color: string
  savedAt: number
  groupId: string | null
  onlyShowInGroup: boolean
  order: number
}

interface WordGroup {
  id: string
  name: string
  createdAt: number
  order: number
  generatedText?: string
}

export default function SavedWordsPage() {
  const [savedWords, setSavedWords] = useState<SavedWord[]>([])
  const [wordGroups, setWordGroups] = useState<WordGroup[]>([])
  const [selectedWord, setSelectedWord] = useState<SavedWord | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<WordGroup | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [draggedWordId, setDraggedWordId] = useState<string | null>(null)
  const [expandGroupedWords, setExpandGroupedWords] = useState(false)
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
  const [showEditGroupModal, setShowEditGroupModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [editingGroup, setEditingGroup] = useState<WordGroup | null>(null)
  const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditingWord, setIsEditingWord] = useState(false)
  const [editedWord, setEditedWord] = useState<SavedWord | null>(null)

  useEffect(() => {
    loadSavedWords()
    loadWordGroups()
    loadPreferences()
  }, [])

  const loadPreferences = () => {
    const prefs = localStorage.getItem('savedWordsPreferences')
    if (prefs) {
      const parsed = JSON.parse(prefs)
      setExpandGroupedWords(parsed.expandGroupedWords || false)
    }
  }

  const savePreferences = (expandGrouped: boolean) => {
    localStorage.setItem('savedWordsPreferences', JSON.stringify({
      expandGroupedWords: expandGrouped
    }))
  }

  const loadWordGroups = () => {
    const groups = localStorage.getItem('wordGroups')
    if (groups) {
      setWordGroups(JSON.parse(groups))
    }
  }

  const saveWordGroups = (groups: WordGroup[]) => {
    localStorage.setItem('wordGroups', JSON.stringify(groups))
    setWordGroups(groups)
  }

  const loadSavedWords = () => {
    const allSavedWords: SavedWord[] = []

    // Iterate through all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)

      // Find highlights for each article
      if (key && key.startsWith('highlights_')) {
        const articleId = key.replace('highlights_', '')
        const highlights = JSON.parse(localStorage.getItem(key) || '[]')

        // Get saved word IDs for this article
        const savedWordsKey = `savedWords_${articleId}`
        const savedWordIds = JSON.parse(localStorage.getItem(savedWordsKey) || '[]')

        // Filter highlights that are saved
        const savedHighlights = highlights.filter((h: any) =>
          savedWordIds.includes(h.id) && h.explanation
        )

        // Add to our collection with metadata
        savedHighlights.forEach((h: any, index: number) => {
          allSavedWords.push({
            id: h.id,
            word: h.explanation.word || h.text,
            meaning: h.explanation.meaning,
            grammar: h.explanation.grammar,
            example: h.explanation.example,
            articleId: articleId,
            color: h.color,
            savedAt: Date.now() - (savedHighlights.length - index),
            groupId: h.groupId || null,
            onlyShowInGroup: h.onlyShowInGroup || false,
            order: h.order || 0
          })
        })
      }
    }

    // Check if we have a custom order saved
    const customOrder = localStorage.getItem('savedWordsOrder')
    if (customOrder) {
      const orderArray = JSON.parse(customOrder)
      // Sort by custom order
      allSavedWords.sort((a, b) => {
        const aIndex = orderArray.indexOf(a.id)
        const bIndex = orderArray.indexOf(b.id)
        // If not found in custom order, put at end
        if (aIndex === -1 && bIndex === -1) return a.savedAt - b.savedAt
        if (aIndex === -1) return 1
        if (bIndex === -1) return -1
        return aIndex - bIndex
      })
    } else {
      // Sort by saved order (earliest first)
      allSavedWords.sort((a, b) => a.savedAt - b.savedAt)
    }

    setSavedWords(allSavedWords)
  }

  const saveWordsOrder = (words: SavedWord[]) => {
    const orderArray = words.map(w => w.id)
    localStorage.setItem('savedWordsOrder', JSON.stringify(orderArray))
  }

  const handleDragStart = (index: number, wordId?: string) => {
    setDraggedIndex(index)
    if (wordId) {
      setDraggedWordId(wordId)
    }
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newWords = [...savedWords]
    const draggedWord = newWords[draggedIndex]
    newWords.splice(draggedIndex, 1)
    newWords.splice(index, 0, draggedWord)

    setSavedWords(newWords)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDraggedWordId(null)
    setDragOverGroupId(null)
    saveWordsOrder(savedWords)
  }

  const handleDropOnGroup = (groupId: string) => {
    if (!draggedWordId) return

    const wordIndex = savedWords.findIndex(w => w.id === draggedWordId)
    if (wordIndex === -1) return

    const updatedWords = [...savedWords]
    updatedWords[wordIndex] = {
      ...updatedWords[wordIndex],
      groupId: groupId,
      onlyShowInGroup: true
    }

    setSavedWords(updatedWords)
    updateWordInLocalStorage(updatedWords[wordIndex])
    setDraggedWordId(null)
    setDragOverGroupId(null)
    setDraggedIndex(null)
  }

  const updateWordInLocalStorage = (word: SavedWord) => {
    const highlightsKey = `highlights_${word.articleId}`
    const highlights = JSON.parse(localStorage.getItem(highlightsKey) || '[]')

    const highlightIndex = highlights.findIndex((h: any) => h.id === word.id)
    if (highlightIndex !== -1) {
      highlights[highlightIndex] = {
        ...highlights[highlightIndex],
        groupId: word.groupId,
        onlyShowInGroup: word.onlyShowInGroup,
        order: word.order
      }
      localStorage.setItem(highlightsKey, JSON.stringify(highlights))
    }
  }

  const createGroup = () => {
    if (!newGroupName.trim()) return

    const newGroup: WordGroup = {
      id: `group_${Date.now()}`,
      name: newGroupName.trim(),
      createdAt: Date.now(),
      order: wordGroups.length
    }

    const updatedGroups = [...wordGroups, newGroup]
    saveWordGroups(updatedGroups)
    setNewGroupName('')
    setShowCreateGroupModal(false)
  }

  const deleteGroup = (groupId: string) => {
    // Remove group from all words
    const updatedWords = savedWords.map(word => {
      if (word.groupId === groupId) {
        const updated = { ...word, groupId: null, onlyShowInGroup: false }
        updateWordInLocalStorage(updated)
        return updated
      }
      return word
    })

    setSavedWords(updatedWords)

    // Remove group
    const updatedGroups = wordGroups.filter(g => g.id !== groupId)
    saveWordGroups(updatedGroups)
  }

  const renameGroup = () => {
    if (!editingGroup || !newGroupName.trim()) return

    const updatedGroups = wordGroups.map(g =>
      g.id === editingGroup.id ? { ...g, name: newGroupName.trim() } : g
    )

    saveWordGroups(updatedGroups)
    setNewGroupName('')
    setEditingGroup(null)
    setShowEditGroupModal(false)
  }

  const openEditGroupModal = (group: WordGroup) => {
    setEditingGroup(group)
    setNewGroupName(group.name)
    setShowEditGroupModal(true)
  }

  const removeWordFromGroup = (wordId: string) => {
    const updatedWords = savedWords.map(word => {
      if (word.id === wordId) {
        const updated = { ...word, groupId: null, onlyShowInGroup: false }
        updateWordInLocalStorage(updated)
        return updated
      }
      return word
    })

    setSavedWords(updatedWords)

    // Close group view if we're viewing it
    if (selectedGroup) {
      const wordsInGroup = updatedWords.filter(w => w.groupId === selectedGroup.id)
      if (wordsInGroup.length === 0) {
        setSelectedGroup(null)
      }
    }
  }

  const generateText = async (groupId: string) => {
    const wordsInGroup = getWordsInGroup(groupId)

    if (wordsInGroup.length === 0) {
      return
    }

    setIsGenerating(true)

    try {
      // Format words for the API
      const formattedWords = wordsInGroup.map(word => ({
        phrase: word.word,
        explanation: {
          meaning: word.meaning,
          grammar: word.grammar,
          examples: {
            original: word.example,
            new: word.example
          }
        }
      }))

      const response = await fetch('/api/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ words: formattedWords }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate text')
      }

      const data = await response.json()

      // Update the group with the generated text
      const updatedGroups = wordGroups.map(group =>
        group.id === groupId
          ? { ...group, generatedText: data.text }
          : group
      )
      saveWordGroups(updatedGroups)
    } catch (error) {
      console.error('Error generating text:', error)

      // Save error message in the group
      const updatedGroups = wordGroups.map(group =>
        group.id === groupId
          ? { ...group, generatedText: 'Failed to generate text. Please try again.' }
          : group
      )
      saveWordGroups(updatedGroups)
    } finally {
      setIsGenerating(false)
    }
  }

  const unsaveWord = (wordId: string) => {
    const word = savedWords.find(w => w.id === wordId)
    if (!word) return

    // Remove from savedWords list
    const savedWordsKey = `savedWords_${word.articleId}`

    const savedWordIds = JSON.parse(localStorage.getItem(savedWordsKey) || '[]')
    const updatedSavedIds = savedWordIds.filter((id: string) => id !== wordId)
    localStorage.setItem(savedWordsKey, JSON.stringify(updatedSavedIds))

    // Update state
    const updatedWords = savedWords.filter(w => w.id !== wordId)
    setSavedWords(updatedWords)
    saveWordsOrder(updatedWords)

    // Close modals if this word is selected
    if (selectedWord?.id === wordId) {
      setSelectedWord(null)
    }
  }

  const startEditingWord = (word: SavedWord) => {
    setEditedWord({ ...word })
    setIsEditingWord(true)
  }

  const cancelEditingWord = () => {
    setEditedWord(null)
    setIsEditingWord(false)
  }

  const saveWordEdits = () => {
    if (!editedWord) return

    // Update in localStorage
    const highlightsKey = `highlights_${editedWord.articleId}`
    const highlights = JSON.parse(localStorage.getItem(highlightsKey) || '[]')

    const highlightIndex = highlights.findIndex((h: any) => h.id === editedWord.id)
    if (highlightIndex !== -1) {
      highlights[highlightIndex] = {
        ...highlights[highlightIndex],
        explanation: {
          word: editedWord.word,
          meaning: editedWord.meaning,
          grammar: editedWord.grammar,
          example: editedWord.example
        }
      }
      localStorage.setItem(highlightsKey, JSON.stringify(highlights))
    }

    // Update in state
    const updatedWords = savedWords.map(w =>
      w.id === editedWord.id ? editedWord : w
    )
    setSavedWords(updatedWords)

    // Update selected word if it's the one being edited
    if (selectedWord?.id === editedWord.id) {
      setSelectedWord(editedWord)
    }

    setIsEditingWord(false)
    setEditedWord(null)
  }

  const toggleExpandGroupedWords = () => {
    const newValue = !expandGroupedWords
    setExpandGroupedWords(newValue)
    savePreferences(newValue)
  }

  const getWordsToDisplay = () => {
    if (expandGroupedWords) {
      return savedWords
    } else {
      return savedWords.filter(w => !w.onlyShowInGroup)
    }
  }

  const getGroupsToDisplay = () => {
    return wordGroups
  }

  const getWordsInGroup = (groupId: string) => {
    return savedWords.filter(w => w.groupId === groupId)
  }

  const formatText = (text: string) => {
    if (!text) return null

    const parts: React.ReactNode[] = []
    let lastIndex = 0

    const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*)/g
    let match

    while ((match = pattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index)
        parts.push(...beforeText.split('\n').flatMap((line, i, arr) =>
          i < arr.length - 1 ? [line, <br key={`br-${lastIndex}-${i}`} />] : [line]
        ))
      }

      const matchedText = match[0]

      if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
        const boldText = matchedText.slice(2, -2)
        parts.push(<strong key={`bold-${match.index}`} className="font-bold">{boldText}</strong>)
      } else if (matchedText.startsWith('*') && matchedText.endsWith('*')) {
        const italicText = matchedText.slice(1, -1)
        parts.push(<em key={`italic-${match.index}`} className="italic">{italicText}</em>)
      }

      lastIndex = pattern.lastIndex
    }

    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex)
      parts.push(...remainingText.split('\n').flatMap((line, i, arr) =>
        i < arr.length - 1 ? [line, <br key={`br-end-${i}`} />] : [line]
      ))
    }

    return <>{parts}</>
  }

  const wordsToDisplay = getWordsToDisplay()
  const groupsToDisplay = getGroupsToDisplay()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Articles
        </Link>

        {/* Header */}
        <header className="bg-white border-2 border-gray-200 rounded-lg p-8 mb-8">
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Bookmark className="h-8 w-8 text-green-600" fill="currentColor" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Saved Words
                </h1>
                <p className="text-gray-600 mt-2">
                  Review and manage your saved vocabulary
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {savedWords.length > 0 && (
                <button
                  onClick={toggleExpandGroupedWords}
                  className={`px-4 py-2 rounded-lg font-medium transition-all inline-flex items-center gap-2 ${
                    expandGroupedWords
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {expandGroupedWords ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  {expandGroupedWords ? 'Hide Grouped Words' : 'Show All Words'}
                </button>
              )}
              <button
                onClick={() => setShowCreateGroupModal(true)}
                className="px-4 py-2 rounded-lg font-medium transition-all inline-flex items-center gap-2 bg-green-600 text-white hover:bg-green-700"
              >
                <Plus className="h-5 w-5" />
                Create Group
              </button>
            </div>
          </div>
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mt-4">
            <p className="text-green-900 font-semibold">
              {savedWords.length} {savedWords.length === 1 ? 'word' : 'words'} saved
              {wordGroups.length > 0 && ` • ${wordGroups.length} ${wordGroups.length === 1 ? 'group' : 'groups'}`}
            </p>
          </div>
        </header>

        {/* Words Grid or Empty State */}
        {savedWords.length === 0 ? (
          <div className="bg-white border-2 border-gray-200 rounded-lg p-12">
            <div className="text-center">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bookmark className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No saved words yet
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Start reading articles and save words you want to review. Click the bookmark icon next to any word explanation to save it.
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Browse Articles
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Groups Display */}
            {groupsToDisplay.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Groups</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {groupsToDisplay.map((group) => {
                    const wordsInGroup = getWordsInGroup(group.id)
                    return (
                      <div
                        key={group.id}
                        onDragOver={(e) => {
                          e.preventDefault()
                          setDragOverGroupId(group.id)
                        }}
                        onDragLeave={() => setDragOverGroupId(null)}
                        onDrop={(e) => {
                          e.preventDefault()
                          handleDropOnGroup(group.id)
                        }}
                        onClick={() => setSelectedGroup(group)}
                        className={`bg-gradient-to-br from-amber-50 to-amber-100 border-2 rounded-lg p-6 transition-all cursor-pointer ${
                          dragOverGroupId === group.id
                            ? 'border-amber-500 shadow-lg scale-105'
                            : 'border-amber-300 hover:shadow-lg hover:border-amber-400'
                        }`}
                      >
                        <div className="text-center">
                          <Folder className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                          <p className="text-lg font-bold text-gray-900 mb-1">{group.name}</p>
                          <p className="text-sm text-gray-600">{wordsInGroup.length} {wordsInGroup.length === 1 ? 'word' : 'words'}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Words Display */}
            {wordsToDisplay.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {expandGroupedWords ? 'All Words' : 'Ungrouped Words'}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {wordsToDisplay.map((word, index) => (
                    <div
                      key={word.id}
                      draggable={true}
                      onDragStart={() => handleDragStart(index, word.id)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`bg-white border-2 border-gray-200 rounded-lg p-6 transition-all group relative cursor-grab active:cursor-grabbing hover:shadow-lg hover:border-green-300 ${
                        draggedIndex === index ? 'opacity-50' : ''
                      }`}
                      style={{ borderLeftWidth: '4px', borderLeftColor: word.color }}
                    >
                      {/* Unsave button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          unsaveWord(word.id)
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>

                      <div
                        className="text-center"
                        onClick={() => setSelectedWord(word)}
                      >
                        <p className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                          {word.word}
                        </p>
                        {expandGroupedWords && word.groupId && (
                          <p className="text-xs text-amber-600 mt-1 flex items-center justify-center gap-1">
                            <Folder className="h-3 w-3" />
                            {wordGroups.find(g => g.id === word.groupId)?.name}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {wordsToDisplay.length === 0 && groupsToDisplay.length === 0 && (
              <div className="text-center py-12 bg-white border-2 border-gray-200 rounded-lg">
                <p className="text-gray-600">All words are in groups. Toggle "Expand Grouped" to see them.</p>
              </div>
            )}
          </>
        )}

        {/* Create Group Modal */}
        {showCreateGroupModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowCreateGroupModal(false)
              setNewGroupName('')
            }}
          >
            <div
              className="bg-white rounded-lg max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Group</h2>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createGroup()}
                placeholder="Enter group name..."
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none mb-4"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowCreateGroupModal(false)
                    setNewGroupName('')
                  }}
                  className="px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={createGroup}
                  disabled={!newGroupName.trim()}
                  className="px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Group Modal */}
        {showEditGroupModal && editingGroup && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowEditGroupModal(false)
              setEditingGroup(null)
              setNewGroupName('')
            }}
          >
            <div
              className="bg-white rounded-lg max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Rename Group</h2>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && renameGroup()}
                placeholder="Enter new group name..."
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none mb-4"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowEditGroupModal(false)
                    setEditingGroup(null)
                    setNewGroupName('')
                  }}
                  className="px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={renameGroup}
                  disabled={!newGroupName.trim()}
                  className="px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Rename
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Group View Modal */}
        {selectedGroup && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedGroup(null)}
          >
            <div
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Group Header */}
              <div className="sticky top-0 bg-gradient-to-r from-amber-100 to-amber-200 border-b-2 border-amber-300 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="h-8 w-8 text-amber-700" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedGroup.name}</h2>
                      <p className="text-sm text-gray-600">
                        {getWordsInGroup(selectedGroup.id).length} {getWordsInGroup(selectedGroup.id).length === 1 ? 'word' : 'words'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditGroupModal(selectedGroup)
                        setSelectedGroup(null)
                      }}
                      className="p-2 rounded-lg hover:bg-amber-300 transition-colors"
                      title="Rename group"
                    >
                      <Edit2 className="h-5 w-5 text-gray-700" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteGroup(selectedGroup.id)
                        setSelectedGroup(null)
                      }}
                      className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                      title="Delete group"
                    >
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </button>
                    <button
                      onClick={() => setSelectedGroup(null)}
                      className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <X className="h-6 w-6 text-gray-700" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Group Content */}
              <div className="p-6">
                {getWordsInGroup(selectedGroup.id).length === 0 ? (
                  <div className="text-center py-12">
                    <FolderX className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No words in this group yet. Drag words here to add them.</p>
                  </div>
                ) : (
                  <>
                    {/* Generate Text Button */}
                    <div className="mb-6">
                      <button
                        onClick={() => generateText(selectedGroup.id)}
                        disabled={isGenerating}
                        className="w-full px-6 py-3 rounded-lg font-medium transition-all inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? (
                          <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                          </>
                        ) : (
                          <>
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Generate Practice Text
                          </>
                        )}
                      </button>
                    </div>

                    {/* Generated Text Display */}
                    {selectedGroup.generatedText && (
                      <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-blue-900 mb-3">Generated Practice Text:</h3>
                        <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
                          {selectedGroup.generatedText}
                        </p>
                      </div>
                    )}

                    {/* Words Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {getWordsInGroup(selectedGroup.id).map((word) => (
                        <div
                          key={word.id}
                          className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-green-300 transition-all cursor-pointer group relative"
                          style={{ borderLeftWidth: '4px', borderLeftColor: word.color }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeWordFromGroup(word.id)
                            }}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-amber-100"
                            title="Remove from group"
                          >
                            <FolderX className="h-4 w-4 text-amber-600" />
                          </button>
                          <div
                            className="text-center"
                            onClick={() => {
                              setSelectedWord(word)
                            }}
                          >
                            <p className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                              {word.word}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Word Detail Popup Modal */}
        {selectedWord && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedWord(null)}
          >
            <div
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-green-100 border-b-2 border-green-200 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isEditingWord && editedWord ? (
                    <input
                      type="text"
                      value={editedWord.word}
                      onChange={(e) => setEditedWord({ ...editedWord, word: e.target.value })}
                      className="px-4 py-2 rounded-lg font-bold text-lg border-2 border-gray-300 focus:border-green-500 focus:outline-none"
                      style={{ backgroundColor: selectedWord.color }}
                    />
                  ) : (
                    <span
                      className="px-4 py-2 rounded-lg font-bold text-lg"
                      style={{ backgroundColor: selectedWord.color }}
                    >
                      {selectedWord.word}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {isEditingWord ? (
                    <>
                      <button
                        onClick={saveWordEdits}
                        className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditingWord}
                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditingWord(selectedWord)}
                        className="p-2 rounded-lg hover:bg-green-200 transition-colors"
                        title="Edit word"
                      >
                        <Edit2 className="h-5 w-5 text-green-700" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          unsaveWord(selectedWord.id)
                        }}
                        className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                        title="Unsave word"
                      >
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </button>
                      <button
                        onClick={() => setSelectedWord(null)}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                {/* Meaning */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-blue-900 mb-2">
                    💬 Meaning
                  </div>
                  {isEditingWord && editedWord ? (
                    <textarea
                      value={editedWord.meaning}
                      onChange={(e) => setEditedWord({ ...editedWord, meaning: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-base text-gray-700 min-h-[80px]"
                      placeholder="Enter meaning..."
                    />
                  ) : (
                    <div className="text-base text-gray-700">
                      {formatText(selectedWord.meaning)}
                    </div>
                  )}
                </div>

                {/* Grammar */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-purple-900 mb-2">
                    ✨ Grammar
                  </div>
                  {isEditingWord && editedWord ? (
                    <textarea
                      value={editedWord.grammar}
                      onChange={(e) => setEditedWord({ ...editedWord, grammar: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-base text-gray-700 min-h-[80px]"
                      placeholder="Enter grammar information..."
                    />
                  ) : (
                    <div className="text-base text-gray-700">
                      {formatText(selectedWord.grammar)}
                    </div>
                  )}
                </div>

                {/* Example */}
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-green-900 mb-2">
                    📖 Example Sentence
                  </div>
                  {isEditingWord && editedWord ? (
                    <textarea
                      value={editedWord.example}
                      onChange={(e) => setEditedWord({ ...editedWord, example: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-base text-gray-700 italic min-h-[80px]"
                      placeholder="Enter example sentence..."
                    />
                  ) : (
                    <div className="text-base text-gray-700 italic">
                      {formatText(selectedWord.example)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
