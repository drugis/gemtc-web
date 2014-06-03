'use strict';
define(['angular'], function(angular) {
  var dependencies = [];

  var RelativeEffectsTableService = function() {

    function createEmptyCells(size) {
      var array = [];
      for (var i = 0; i < size; i++) {
        array.push({
          cellType: 'empty'
        });
      }
      return array;
    }


    function buildTable(relativeEffects, isLogScale) {
      var table = {
        rows: []
      };

      var rowIndex = -1;
      var currentEffect;
      var row;

      angular.forEach(relativeEffects, function(relativeEffect) {
        if (relativeEffect.t1 !== currentEffect) {
          ++rowIndex;
          currentEffect = relativeEffect.t1;
          var emptyCells = createEmptyCells(rowIndex);
          row = {
            cells: emptyCells
          };
          row.cells.push({
            cellType: 'label',
            label: relativeEffect.t1
          });
          table.rows.push(row);
        }

        row.cells.push({
          cellType: 'effect',
          mean: isLogScale ? Math.exp(relativeEffect.quantiles['50%']) : relativeEffect.quantiles['50%'],
          lowerBound: isLogScale ? Math.exp(relativeEffect.quantiles['2.5%']) : relativeEffect.quantiles['2.5%'],
          upperBound: isLogScale ? Math.exp(relativeEffect.quantiles['97.5%']): relativeEffect.quantiles['97.5%']
        });

      });
      var lastRow = {
        cells: createEmptyCells(rowIndex+1)
      };
      lastRow.cells.push({
        cellType: 'label',
        label: relativeEffects[relativeEffects.length - 1].t2
      });
      table.rows.push(lastRow);
      return table;
    }

    return {
      buildTable: buildTable
    };
  };
  return dependencies.concat(RelativeEffectsTableService);
});