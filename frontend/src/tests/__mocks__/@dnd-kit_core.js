module.exports = {
  DndContext: ({ children }) => children,
  closestCorners: jest.fn(),
  useDraggable: jest.fn().mockImplementation(() => ({
    setNodeRef: jest.fn(),
    listeners: {},
    attributes: {},
    transform: null,
    isDragging: false,
  })),
}; 