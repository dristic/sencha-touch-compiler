Ext.define('example.config', {
  extend: 'Ext.data.Store',
  
  requires: [
    'example.controller.One',
    'example.controller.Two'
  ]
});