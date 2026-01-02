# V5: Saved Words - Enhanced Grouping & Management Features

## Overview
This document outlines the enhanced features and functionalities for the "Saved Words" page, building upon the existing V4 implementation. The focus is on improved grouping, word management, and user experience enhancements.

---

## 1. Grouping Functionality

### 1.1 Create Group
- **Feature**: A prominent "Create Group" button on the main Saved Words screen
- **Functionality**:
  - Clicking the button opens a dialog/modal prompting the user to enter a group name
  - Group name is required and must be unique
  - Upon creation, an empty group is created and displayed on the main screen

### 1.2 Drag and Drop into Groups
- **Feature**: Drag saved words from the main view into existing groups
- **Functionality**:
  - Users can drag individual word cards and drop them onto group cards
  - Once a word is added to a group, it is **removed from the main "Saved Words" screen** by default
  - Visual feedback during drag (e.g., highlighting valid drop zones)
  - The word's `group` field is updated in the database
  - The word's `only_show_in_group` flag is set to `true` by default

### 1.3 Group View
- **Feature**: Click on a group card to view its contents
- **Functionality**:
  - Clicking a group card opens a dedicated group view/modal
  - Displays all words contained within that group
  - Each word card shows the German word initially
  - Clicking individual word cards reveals meaning, grammar, and example sentence (same as main view)

### 1.4 Generate Text Button (Future Feature -- Skip this feature for now)
- **Feature**: A "Generate Text" button within the group view
- **Functionality**:
  - **Status**: Currently disabled/greyed out with tooltip: "Text generation coming soon"
  - **Future Implementation**:
    - Will generate a paragraph or sentence using the words in the group
    - Text complexity adapts to the number of words:
      - **Few words (1-5)**: Generate a simple sentence
      - **More words (6+)**: Generate a short paragraph
    - Generated text should be easy to read and understand
    - Avoids overly complex sentence structures
    - Designed to aid memorization by showing words in natural context
  - **UI Placement**: Prominent button at the top of the group view

---

## 2. Toggle for Grouped Words

### 2.1 Expand Grouped Words Toggle
- **Feature**: A toggle button on the main "Saved Words" screen labeled "Expand Grouped Words"
- **Functionality**:
  - **When Disabled (Default)**:
    - Only group names are visible as cards
    - Individual words within groups are hidden
    - Provides a clean, organized view
  - **When Enabled**:
    - All saved words are visible, including those in groups
    - Group cards expand to show their contained words inline
    - OR: Group cards remain, but grouped words also appear individually (maintaining their group association visually)
  - **State Persistence**: Toggle state is saved in localStorage/user preferences

### 2.2 Visual Indicators
- Words that belong to a group should have a visual indicator (e.g., a small group icon or tag) even when expanded
- This helps users understand the organizational structure

---

## 3. Group Management

### 3.1 Remove Word from Group
- **Feature**: Function to remove a word from its group while in the group view
- **Functionality**:
  - Each word card in the group view has a "Remove from Group" button (e.g., an 'X' icon or three-dot menu)
  - Clicking removes the word from the group
  - The word is returned to the main "Saved Words" screen
  - The word's `group` field is set to `null`
  - The word's `only_show_in_group` flag is set to `false`
  - Confirmation dialog optional: "Remove word from this group?"

### 3.2 Delete/Rename Group
- **Feature**: Manage group properties
- **Functionality**:
  - **Rename Group**: Edit group name via three-dot menu or edit icon
  - **Delete Group**:
    - Removes the group entirely
    - All words in the group are returned to the main saved words list
    - Confirmation required: "Delete this group? All words will be moved back to the main list."

---

## 4. Unsaving Words

### 4.1 Unsave from Main Screen
- **Feature**: Direct unsave functionality on the main "Saved Words" screen
- **Functionality**:
  - Each word card has an "Unsave" or "Delete" button (e.g., trash icon)
  - Clicking prompts confirmation: "Remove this word from your saved list?"
  - Upon confirmation, the word is deleted from the database
  - The card is removed from the UI with a smooth animation

### 4.2 Unsave from Group View
- **Feature**: Ability to unsave words while viewing a group
- **Functionality**:
  - Similar to main screen unsave
  - Word is permanently removed from saved words (not just from the group)
  - Clear distinction between "Remove from Group" and "Unsave Word" actions to prevent confusion

---

## User Experience Considerations

### Visual Hierarchy
- **Group Cards**: Visually distinct from individual word cards (e.g., different color, larger size, or special border)
- **Drag States**: Clear visual feedback during drag-and-drop operations
- **Empty States**:
  - Empty groups show a helpful message: "Drag words here to add them to this group"
  - No saved words: "You haven't saved any words yet. Start reading articles to build your vocabulary!"

### Interactions
- **Smooth Animations**: Card movements, expansions, and deletions should be animated
- **Responsive Design**: All features work seamlessly on mobile and desktop
- **Keyboard Support**: Group creation, navigation, and management accessible via keyboard

### Data Persistence
- All changes (grouping, ungrouping, unsaving, reordering) immediately sync to the database
- Optimistic UI updates for better perceived performance
- Error handling with user-friendly messages if operations fail

---

## Technical Implementation Notes

### Data Model Updates
```typescript
interface SavedWord {
  id: string
  word: string
  meaning: string
  grammar: string
  example_sentence: string
  article_id: string
  group_id: string | null          // Reference to group
  only_show_in_group: boolean      // Hide from main view when true
  order: number                    // For custom ordering
  created_at: string
}

interface WordGroup {
  id: string
  name: string
  created_at: string
  order: number                    // For group ordering
}
```

### API Endpoints Needed
- `POST /api/groups` - Create new group
- `PUT /api/groups/:id` - Update group name
- `DELETE /api/groups/:id` - Delete group
- `PUT /api/saved-words/:id/group` - Add/remove word from group
- `DELETE /api/saved-words/:id` - Unsave word

### LocalStorage Fallback
If database operations are not yet implemented, use localStorage with the following structure:
```javascript
{
  savedWords: [...],
  wordGroups: [...],
  preferences: {
    expandGroupedWords: false
  }
}
```

---

## Future Enhancements

1. **Text Generation**: AI-powered sentence/paragraph generation using grouped words
2. **Export Groups**: Export word groups as flashcards or study sheets
3. **Group Templates**: Pre-made group themes (e.g., "Food Vocabulary", "Business Terms")
4. **Statistics**: Track learning progress per group
5. **Sharing**: Share word groups with other users

---

## Summary

This enhanced version of the Saved Words feature provides users with powerful organizational tools:
- **Flexible Grouping**: Create custom groups and organize words via drag-and-drop
- **Smart Visibility**: Toggle between grouped and expanded views
- **Easy Management**: Remove words from groups or unsave them entirely
- **Future-Ready**: Disabled text generation button prepared for AI integration

The design prioritizes user control, clarity, and seamless interaction while maintaining a clean, intuitive interface.
