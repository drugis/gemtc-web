'use strict';
define(['angular', 'lodash'], function(angular, _) {
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

    function mapTreatmentIdToName(treatments) {
      return _.reduce(treatments, function(memo, treatment) {
        memo[treatment.id] = treatment.name;
        return memo;
      }, {});
    }

    function buildTable(relativeEffects, treatments, isLogScale) {
      var table = {
        rows: []
      };

      var rowIndex = -1;
      var currentEffect;
      var row;
      var treatmentIdToNameMap = mapTreatmentIdToName(treatments);

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
            label: treatmentIdToNameMap[relativeEffect.t1]
          });
          table.rows.push(row);
        }

        row.cells.push({
          cellType: 'effect',
          mean: isLogScale ? Math.exp(relativeEffect.quantiles['50%']) : relativeEffect.quantiles['50%'],
          lowerBound: isLogScale ? Math.exp(relativeEffect.quantiles['2.5%']) : relativeEffect.quantiles['2.5%'],
          upperBound: isLogScale ? Math.exp(relativeEffect.quantiles['97.5%']) : relativeEffect.quantiles['97.5%']
        });

      });
      var lastRow = {
        cells: createEmptyCells(rowIndex + 1)
      };
      lastRow.cells.push({
        cellType: 'label',
        label: treatmentIdToNameMap[relativeEffects[relativeEffects.length - 1].t2]
      });
      table.rows.push(lastRow);
      return table;
    }

    function buildRow(relativeEffects, treatments, baselineId, isLogScale) {
      var treatmentIdToNameMap = mapTreatmentIdToName(treatments);
      var row = [];
      _.forEach(relativeEffects, function(relativeEffect) {
        if (parseInt(relativeEffect.t1) === baselineId && _.find(treatments, ['id', parseInt(relativeEffect.t2)])) {
          row.push({
            id: relativeEffect.t2,
            name: treatmentIdToNameMap[relativeEffect.t2],
            median: isLogScale ? Math.exp(relativeEffect.quantiles['50%']) : relativeEffect.quantiles['50%'],
            lowerBound: isLogScale ? Math.exp(relativeEffect.quantiles['2.5%']) : relativeEffect.quantiles['2.5%'],
            upperBound: isLogScale ? Math.exp(relativeEffect.quantiles['97.5%']) : relativeEffect.quantiles['97.5%']
          });
        }
        if (parseInt(relativeEffect.t2) === baselineId && _.find(treatments, ['id', parseInt(relativeEffect.t1)])) {
          row.push({
            id: relativeEffect.t1,
            name: treatmentIdToNameMap[relativeEffect.t1],
            median: isLogScale ? Math.exp(relativeEffect.quantiles['50%']) : relativeEffect.quantiles['50%'],
            lowerBound: isLogScale ? Math.exp(relativeEffect.quantiles['2.5%']) : relativeEffect.quantiles['2.5%'],
            upperBound: isLogScale ? Math.exp(relativeEffect.quantiles['97.5%']) : relativeEffect.quantiles['97.5%']
          });
        }
      });
      return row;
    }

    return {
      buildTable: buildTable,
      buildRow: buildRow
    };
  };
  return dependencies.concat(RelativeEffectsTableService);
});
