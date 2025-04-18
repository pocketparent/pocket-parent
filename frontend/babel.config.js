module.exports = {
  plugins: [
    [
      'babel-plugin-transform-imports',
      {
        '@material-ui/core': {
          transform: '@material-ui/core/${member}',
          preventFullImport: true
        },
        '@material-ui/icons': {
          transform: '@material-ui/icons/${member}',
          preventFullImport: true
        },
        '@material-ui/lab': {
          transform: '@material-ui/lab/${member}',
          preventFullImport: true
        }
      }
    ]
  ]
}
