window.zgrid = function() {
  const grid = function(element) {

    class View {
      constructor(params) {
        params = params || {};

        this.element = params.element;
        this.aspect = params.aspect || (1);
        this.views = [];
        this.depth = params.depth || 0;

        this.horizontal = false;

        map[runningIndex] = this;
        this.id = runningIndex;
        runningIndex++;
      }

      area() {
        return this.element.width() * this.element.height();
      }

      canSplit() {
        return this.views.length < 2;
      }

      split() {
        this.element.removeClass('zgrid-view');

        const a = new View({
          element: $('<div/>').addClass('zgrid-view'),
          depth: this.depth + 1,
          aspect: Math.random() + 0.5
        });
        const b = new View({
          element: $('<div/>').addClass('zgrid-view'),
          depth: this.depth + 1,
          aspect: Math.random() + 0.5
        });

        this.element.append(a.element);
        this.element.append(b.element);
        this.views = [a, b];
        this.layout();
      }

      merge() {
        this.views[0].element.remove();
        this.views[1].element.remove();
        
        delete map[this.views[0].id];
        delete map[this.views[1].id];

        this.views = [];

        this.element.addClass('zgrid-view');
      }

      layout() {
        if (this.views.length === 0) {
          return;
        }

        this._layout();

        this.views[0].layout();
        this.views[1].layout();
      }

      getChildrenAspectRatio() {
        const a = this.views[0];
        const b = this.views[1];

        if (this.horizontal) {
          return a.aspect + b.aspect;
        } else {
          return 1 / (1 / a.aspect + 1 / b.aspect);
        }
      }

      _layout() {
        const a = this.views[0];
        const b = this.views[1];
        const width = this.element.width();
        const height = this.element.height();

        if (width / height > this.aspect) {

          // Split horizontally

          const total = a.aspect + b.aspect;
          const ratioA = a.aspect / total;
          const ratioB = b.aspect / total;

          a.element.css({
            position: 'absolute',
            left: 0,
            top: 0,
            width: width * ratioA + 'px',
            height: height + 'px'
          });

          b.element.css({
            position: 'absolute',
            left: width * ratioA + 'px',
            top: 0,
            width: width * ratioB + 'px',
            height: height + 'px'
          });

          this.horizontal = true;

        } else {
          const total = (1 / a.aspect) + (1 / b.aspect);
          const ratioA = 1 / a.aspect / total;
          const ratioB = 1 / b.aspect / total;

          a.element.css({
            position: 'absolute',
            left: 0,
            top: 0,
            width: width + 'px',
            height: height * ratioA + 'px'
          });

          b.element.css({
            position: 'absolute',
            left: 0,
            top: height * ratioA + 'px',
            width: width + 'px',
            height: height * ratioB + 'px'
          });

          this.horizontal = false;

        }
      }
    }

    const visitAll = function(view, callback) {
      callback(view);
      for (var i = 0; i < view.views.length; i++) {
        visitAll(view.views[i]);
      }
    };

    element = element instanceof jQuery ? element : $(element);

    const map = {};
    let runningIndex = 0;

    const root = new View({
      element: element
    });

    function getNodeToSplit() {
      let maxArea = 0;
      let maxNode = null;

      for (let id in map) {
        let node = map[id];
        if (node.canSplit() && node.area() > maxArea) {
          maxNode = node;
          maxArea = node.area();
        }
      }

      return maxNode;
    };

    const nodes = [];

    function add() {
      const node = getNodeToSplit();
      node.split();

      nodes.push(node);

      layout();
    };

    function remove() {
      if (nodes.length === 0) {
        return;
      }
      nodes[nodes.length - 1].merge();
      nodes.pop();
    }

    function layout() {
      root.layout();
    }

    return {
      add,
      remove,
      layout
    };
  };

  return grid;
}();
