define(['Mason', 'jquery'], function (Mason, $) {
  var $empty = $();

  function _internal(fn) {
    var args = [].slice.call(arguments);
    this.internal = (this.internal || 0) + 1;
    fn.call(this, args);
    this.internal -= 1;
  }

  function _ifNotInternal(fn) {
    if (!!this.internal) {
      var args = [].slice.call(arguments);
      fn.call(this, args);
    }
  }

  function TabRow(row) {
    var that = this,
        $row = $(row);

    this.row = row;
    this.$row = $row;
    this.$tabs = $empty;
    this.$selectedTab = $empty;

    // Set up binding for the tab select
    $row.on('click', '.tab', function () {
      that.select(this);
    });
  }
  TabRow.prototype = {
    '_internal': _internal,
    '_ifNotInternal': _ifNotInternal,
    'addTab': function (tab) {
      // Add the class to the tab
      $(tab).addClass('tab');

      // Add the tab to the $tabs
      this.$tabs = this.$tabs.add(tab);

      // Attach it to the row
      this.row.appendChild(tab);
    },
    'select': function (index) {
      // If the index is a number, select the tab at that index
      var $tabs = this.$tabs,
          $selectedTab;
      if (typeof index === 'number') {
        $selectedTab = $tabs.eq(index);
      } else {
        // Otherwise, select that tab explicitly
        $selectedTab = $tabs.filter($(index));
      }

      // Save the index as a property of the row
      this.row.selectedIndex = index;

      // Select the new tab
      this.$selectedTab = $selectedTab;

      // Add a selected class and property to the current tab
      $selectedTab.addClass('isSelected');
      $selectedTab.prop('selected', true);

      // Deselect the last tab
      this._internal(this.deselect);

      // Fire onselect event on the selected tab
      $selectedTab.trigger('select');

      // Fire onchange event on the row
      this._ifNotInternal(function () {
        this.$row.trigger('change');
      });
    },
    'deselect': function () {
      // Take the currently selected tab
      var $deselectedTab = this.$selectedTab;

      // Replace it with an empty slot
      this._ifNotInternal(function () {
        this.$selectedTab = $empty;
      });

      // Remove the class and property
      $deselectedTab.removeClass('isSelected');
      $deselectedTab.removeProp('selected');

      // Fire a deselect event
      $deselectedTab.trigger('deselect');

      // Fire an onchange event on the row
      this._ifNotInternal(function () {
        this.$row.trigger('change');
      });
    }
  };

  Mason.addModule('tabrow', function (tabrow) {
    // Create a row and copy over the attributes of the tab row
    var row = Mason.createNode('div'),
        $row = $(row),
        tabs = [],
        $tabRow = new TabRow(row);

    Mason.setAttributes(row, tabrow);

    // Add the tabrow class to the tab
    $row.addClass('tabRow');

    // If the row has a mini attribute, add the mini class to the tabrow
    if (row.getAttribute('mini') !== null) {
      $row.addClass('tabRowMini');

      // Remove the attribute
      row.removeAttribute('mini');
    }

    // Then, iterate the children of the tabrow
    var childNodes = tabrow.childNodes || [],
        childNode,
        insertNode,
        i = 0,
        len = childNodes.length;
    for (; i < len; i++) {
      childNode = childNodes[i];

      // If the childNode is a 'tab', create it as a 'div'
      if (childNode.nodeName === 'tab') {
        insertNode = Mason.createNode('div', childNode);

        // Save the tab to our list of tabs
        tabs.push(insertNode);

        // Add it to the $tabRow
        $tabRow.addTab(insertNode);
      } else {
      // Otherwise, create the node normally and append it to the row
        insertNode = Mason(childNode);
        row.appendChild(insertNode);
      }
    }

    // Add tab classes to all of the tabs
    var $tabs = $(tabs);
    $tabs.addClass('tab');

    // If there is a tab with the selected property
    var $selectedTab = $tabs.filter(function () { return this.hasAttribute('selected'); });
    if ($selectedTab.length === 0) {
      $selectedTab = $tabs.first();
    }

    // Select the selected tab
    $tabRow.select($selectedTab);

    // Return the row
    return row;
  });

  return TabRow;
});