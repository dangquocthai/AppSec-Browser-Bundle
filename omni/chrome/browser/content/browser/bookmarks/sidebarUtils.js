//@line 39 "/builds/slave/rel-m-esr10-lnx-bld/build/browser/components/places/content/sidebarUtils.js"

var SidebarUtils = {
  handleTreeClick: function SU_handleTreeClick(aTree, aEvent, aGutterSelect) {
    // right-clicks are not handled here
    if (aEvent.button == 2)
      return;

    var tbo = aTree.treeBoxObject;
    var row = { }, col = { }, obj = { };
    tbo.getCellAt(aEvent.clientX, aEvent.clientY, row, col, obj);

    if (row.value == -1 || obj.value == "twisty")
      return;

    var mouseInGutter = false;
    if (aGutterSelect) {
      var x = { }, y = { }, w = { }, h = { };
      tbo.getCoordsForCellItem(row.value, col.value, "image",
                               x, y, w, h);
      // getCoordsForCellItem returns the x coordinate in logical coordinates
      // (i.e., starting from the left and right sides in LTR and RTL modes,
      // respectively.)  Therefore, we make sure to exclude the blank area
      // before the tree item icon (that is, to the left or right of it in
      // LTR and RTL modes, respectively) from the click target area.
      var isRTL = window.getComputedStyle(aTree, null).direction == "rtl";
      if (isRTL)
        mouseInGutter = aEvent.clientX > x.value;
      else
        mouseInGutter = aEvent.clientX < x.value;
    }

//@line 73 "/builds/slave/rel-m-esr10-lnx-bld/build/browser/components/places/content/sidebarUtils.js"
    var modifKey = aEvent.ctrlKey || aEvent.shiftKey;
//@line 75 "/builds/slave/rel-m-esr10-lnx-bld/build/browser/components/places/content/sidebarUtils.js"

    var isContainer = tbo.view.isContainer(row.value);
    var openInTabs = isContainer &&
                     (aEvent.button == 1 ||
                      (aEvent.button == 0 && modifKey)) &&
                     PlacesUtils.hasChildURIs(tbo.view.nodeForTreeIndex(row.value));

    if (aEvent.button == 0 && isContainer && !openInTabs) {
      tbo.view.toggleOpenState(row.value);
      return;
    }
    else if (!mouseInGutter && openInTabs &&
            aEvent.originalTarget.localName == "treechildren") {
      tbo.view.selection.select(row.value);
      PlacesUIUtils.openContainerNodeInTabs(aTree.selectedNode, aEvent, tbo.view);
    }
    else if (!mouseInGutter && !isContainer &&
             aEvent.originalTarget.localName == "treechildren") {
      // Clear all other selection since we're loading a link now. We must
      // do this *before* attempting to load the link since openURL uses
      // selection as an indication of which link to load.
      tbo.view.selection.select(row.value);
      PlacesUIUtils.openNodeWithEvent(aTree.selectedNode, aEvent, tbo.view);
    }
  },

  handleTreeKeyPress: function SU_handleTreeKeyPress(aEvent) {
    // XXX Bug 627901: Post Fx4, this method should take a tree parameter.
    let node = aEvent.target.selectedNode;
    if (node) {
      let view = PlacesUIUtils.getViewForNode(node);
      if (aEvent.keyCode == KeyEvent.DOM_VK_RETURN)
        PlacesUIUtils.openNodeWithEvent(node, aEvent, view);
    }
  },

  /**
   * The following function displays the URL of a node that is being
   * hovered over.
   */
  handleTreeMouseMove: function SU_handleTreeMouseMove(aEvent) {
    if (aEvent.target.localName != "treechildren")
      return;

    var tree = aEvent.target.parentNode;
    var tbo = tree.treeBoxObject;
    var row = { }, col = { }, obj = { };
    tbo.getCellAt(aEvent.clientX, aEvent.clientY, row, col, obj);

    // row.value is -1 when the mouse is hovering an empty area within the tree.
    // To avoid showing a URL from a previously hovered node for a currently
    // hovered non-url node, we must clear the moused-over URL in these cases.
    if (row.value != -1) {
      var node = tree.view.nodeForTreeIndex(row.value);
      if (PlacesUtils.nodeIsURI(node))
        this.setMouseoverURL(node.uri);
      else
        this.setMouseoverURL("");
    }
    else
      this.setMouseoverURL("");
  },

  setMouseoverURL: function SU_setMouseoverURL(aURL) {
    window.top.XULBrowserWindow.setOverLink(aURL, null);
  }
};
