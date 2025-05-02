module.exports = {
  SortableContext: ({ children }) => children,
  useSortable: jest.fn().mockImplementation(() => ({
    setNodeRef: jest.fn(),
    listeners: {},
    attributes: {},
    transform: null,
    transition: null,
    isDragging: false,
  })),
  verticalListSortingStrategy: {},
}; 