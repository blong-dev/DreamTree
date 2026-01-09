// DreamTree Workbook Components

export * from './types';
export { WorkbookView } from './WorkbookView';
export { PromptInput } from './PromptInput';
export { ToolEmbed } from './ToolEmbed';
// Note: HistoryZone and VirtualizedConversation use @tanstack/react-virtual
// which has SSR issues. Import them dynamically with ssr: false.
