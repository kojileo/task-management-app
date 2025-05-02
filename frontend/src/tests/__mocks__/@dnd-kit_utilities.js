module.exports = {
  CSS: {
    Transform: {
      toString: jest.fn().mockImplementation(() => 'translateX(0px) translateY(0px)'),
    },
  },
}; 