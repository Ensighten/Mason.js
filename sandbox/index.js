require.config({
  'paths': {
    // Mason.js
    'Mason': '../src/Mason',
    'jquery': '//ajax.googleapis.com/ajax/libs/jquery/1/jquery',

    // Require.js plugins
    'mason': '../requirejs/mason',
    'text': '../requirejs/text'
  }
});
define(['Mason', 'jquery', '../src/html_to_xml.js', 'tabrow'], function (Mason) {
  var body = document.body;

  // The big 3 items I would like to knock out
  Mason.addModuleBatch({
    // 'tabrow': function (tabrow) {
    // },
    'expand': function (expand) {
      return Mason.createNode('div', expand);
    },
    'list': function (list) {
      return Mason.createNode('div', list);
    }
  });

  // Generate tab rows
  // TODO: Integrate tpl and Mason into a build chain
  require(['text!tabrow.ejs', 'template'], function (tabrow, tpl) {
    var tabRowHtml = tpl(tabrow),
        tabRowFrag = Mason(tabRowHtml),
    // TODO: Consider this part of the build chain?
        tabRow = tabRowFrag.childNodes;

    // Test out some of the events
    $(tabRow).filter('.tabRow').on('change', function () {
      console.log('asdasd');
    });

    $(tabRow).find('.tab').on('select', function () {
      console.log('woot');
    });

    $(tabRow).find('.tab').on('deselect', function () {
      console.log('wasd');
    });

    body.appendChild(tabRowFrag);
  });
});