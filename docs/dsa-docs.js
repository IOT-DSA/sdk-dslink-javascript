var path = require('path');
    Package = require('dgeni').Package;

module.exports = new Package('dsa-docs', [
  require('dgeni-packages/jsdoc'),
  require('dgeni-packages/nunjucks')
])

.processor(require('./processors/addMembers.js'))
.processor(require('./processors/mergeMembers.js'))

.config(function(log) {
  log.level = 'info';
})

.config(function(readFilesProcessor) {
  readFilesProcessor.basePath = path.resolve(__dirname, '..');
  readFilesProcessor.sourceFiles = [
    {
      include: 'lib/**/*.js',
      basePath: 'lib'
    }
  ];
})

.config(function(parseTagsProcessor, getInjectables) {
  parseTagsProcessor.tagDefinitions = getInjectables(require('./tag-defs'));
})

.config(function(computePathsProcessor) {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  if(month < 10)
    month = '0' + month;
  if(day < 10)
    day = '0' + day;

  computePathsProcessor.pathTemplates.push({
    docTypes: ['js'],
    outputPathTemplate: '_posts/' + year + '-' + month + '-' + day + '-${codeName}.md'
  });
})

.config(function(templateFinder) {
  templateFinder.templateFolders.unshift(path.resolve(__dirname, 'templates'));
  templateFinder.templatePatterns.unshift('common.template.md');
})

// doesn't conflict with Jekyll
.config(function(templateEngine) {
  templateEngine.config.tags = {
    blockStart: '<@',
    blockEnd: '@>',
    variableStart: '<$',
    variableEnd: '$>',
    commentStart: '<#',
    commentEnd: '#>'
  };
})

.config(function(writeFilesProcessor) {
  writeFilesProcessor.outputFolder = path.resolve(__dirname, 'build');
});
