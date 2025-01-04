import { AppCodeStore, ViewState } from "../types"
import { computed } from "mobx"
import message from "@/components/Message"

export function initViewState(): ViewState {
  return {
    selectedCodeId: null,
    editedCode: "",
    isEditing: false,
    isPanelCollapsed: false,
    searchQuery: "",
    searchContent: "",
    searchResults: [],
    showImportModal: false,
    showConfirmModal: false,
    showVersionInfo: false,
    importContent: "",
    isImporting: false,
    pendingImportContent: ""
  }
}

export function handleCodeSelect(this: AppCodeStore, moduleId: string) {
  if (!this.currentVersion) return

  this.viewState.selectedCodeId = moduleId
  const actualModuleId = moduleId === "app_entry" ? `${this.appId}_app_entry` : moduleId

  const moduleWrapper = this.currentVersion.modules[actualModuleId]
  if (moduleWrapper) {
    this.viewState.editedCode = moduleWrapper.data.code || ""
    this.viewState.isEditing = false
  }
}

export function handleSearch(this: AppCodeStore) {
  const results: {moduleId: string, matches: number}[] = []
  const codeItems = this.getCodeItems()
  
  codeItems.forEach(item => {
    let matches = 0
    const searchContentLower = this.viewState.searchContent.toLowerCase()
    const codeLower = item.code.toLowerCase()
    
    if (this.viewState.searchContent) {
      const contentMatches = (codeLower.match(new RegExp(searchContentLower, 'g')) || []).length
      matches += contentMatches
    }
    
    if (this.viewState.searchQuery) {
      const titleMatches = item.title.toLowerCase().includes(this.viewState.searchQuery.toLowerCase()) ? 1 : 0
      matches += titleMatches
    }
    
    if (matches > 0) {
      results.push({moduleId: item.id, matches})
    }
  })
  
  results.sort((a, b) => b.matches - a.matches)
  this.viewState.searchResults = results
  
  if (results.length > 0) {
    this.viewState.selectedCodeId = results[0].moduleId
  }
}

export async function handleSaveEdit(this: AppCodeStore) {
  try {
    if (!this.viewState.selectedCodeId) return

    const moduleId = this.viewState.selectedCodeId === "app_entry" 
      ? `${this.appId}_app_entry` 
      : this.viewState.selectedCodeId

    const newVersion = await this.addModules({
      [moduleId]: this.viewState.editedCode,
    })

    this.addVersion(newVersion)
    this.viewState.isEditing = false
    message.success("保存成功")
  } catch (error) {
    console.error("Error saving edit:", error)
    message.error("保存失败，请检查代码格式")
  }
}

export function getCodeItems(this: AppCodeStore) {
  if (!this.currentVersion) return []

  const items = []

  // App Entry
  if (this.currentVersion.app) {
    const entryModuleId = `${this.appId}_app_entry`
    const entryModule = this.currentVersion.modules[entryModuleId]
    if (entryModule) {
      items.push({
        id: "app_entry",
        title: "应用入口 (App Entry)",
        type: "app",
        code: entryModule.data.code,
        updatedAt: entryModule.updatedAt,
      })
    }
  }

  // 其他模块
  Object.entries(this.currentVersion.modules).forEach(([moduleId, moduleWrapper]) => {
    const moduleData = moduleWrapper.data
    if (moduleData.type !== "app") {
      items.push({
        id: moduleId,
        title: moduleData.title || moduleData.name,
        type: moduleData.type,
        name: moduleData.name,
        code: moduleData.code,
        updatedAt: moduleWrapper.updatedAt,
      })
    }
  })

  return items
}

export function getFilteredCodeItems(this: AppCodeStore) {
  const items = this.getCodeItems()
  const { searchResults, searchQuery } = this.viewState

  return searchResults.length > 0 
    ? items.filter(item => searchResults.some(result => result.moduleId === item.id))
    : items.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
}

export function setSearchQuery(this: AppCodeStore, query: string) {
  this.viewState.searchQuery = query
  this.handleSearch()
}

export function setSearchContent(this: AppCodeStore, content: string) {
  this.viewState.searchContent = content
  this.handleSearch()
}

export function togglePanelCollapse(this: AppCodeStore) {
  this.viewState.isPanelCollapsed = !this.viewState.isPanelCollapsed
}

export function setEditMode(this: AppCodeStore, isEditing: boolean) {
  this.viewState.isEditing = isEditing
}

export function updateEditedCode(this: AppCodeStore, code: string) {
  this.viewState.editedCode = code
}

export function handleCancelEdit(this: AppCodeStore) {
  if (!this.currentVersion || !this.viewState.selectedCodeId) return

  const moduleId = this.viewState.selectedCodeId === "app_entry" 
    ? `${this.appId}_app_entry` 
    : this.viewState.selectedCodeId

  const moduleWrapper = this.currentVersion.modules[moduleId]
  if (moduleWrapper) {
    this.viewState.editedCode = moduleWrapper.data.code || ""
  }
  this.viewState.isEditing = false
}