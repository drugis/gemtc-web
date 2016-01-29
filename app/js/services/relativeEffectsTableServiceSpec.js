'use strict';
define(['angular', 'angular-mocks', 'services'], function() {
  describe('the relative effecs table service', function() {
    beforeEach(function() {
      module('gemtc.services');
    });

    it('should create a relative effects table', inject(function(RelativeEffectsTableService) {
      var mockRelativeEffects = buildMockRelativeEffects();
      var expectedTable = {
        rows: [{
          cells: [{
            cellType: 'label',
            label: 'fluox'
          }, {
            cellType: 'effect',
            mean: 0.024046,
            lowerBound: -0.74463,
            upperBound: 0.77857
          }, {
            cellType: 'effect',
            mean: 0.3957,
            lowerBound: -0.086517,
            upperBound: 0.89359
          }, {
            cellType: 'effect',
            mean: 0.21104,
            lowerBound: -0.12607,
            upperBound: 0.55872
          }]
        }, {
          cells: [{
            cellType: 'empty'
          }, {
            cellType: 'label',
            label: 'fluvo'
          }, {
            cellType: 'effect',
            mean: 0.36788,
            lowerBound: -0.5303,
            upperBound: 1.2879
          }, {
            cellType: 'effect',
            mean: 0.18168,
            lowerBound: -0.63341,
            upperBound: 1.0355
          }]
        }, {
          cells: [{
            cellType: 'empty'
          }, {
            cellType: 'empty'
          }, {
            cellType: 'label',
            label: 'mirte'
          }, {
            cellType: 'effect',
            mean: -0.18853,
            lowerBound: -0.61811,
            upperBound: 0.24573
          }]
        }, {
          cells: [{
            cellType: 'empty'
          }, {
            cellType: 'empty'
          }, {
            cellType: 'empty'
          }, {
            cellType: 'label',
            label: 'parox'
          }]
        }]
      };
      var treatments = [{
        id: 1,
        name: 'fluox'
      }, {
        id: 2,
        name: 'fluvo'
      }, {
        id: 3,
        name: 'mirte'
      }, {
        id: 4,
        name: 'parox'
      }];
      var builtTable = RelativeEffectsTableService.buildTable(mockRelativeEffects, false, treatments);
      expect(builtTable).toEqual(expectedTable);
    }));
  });

  function buildMockRelativeEffects() {

    return [{
      "t1": "1",
      "t2": "2",
      "quantiles": {
        "2.5%": -0.74463,
        "25%": -0.22362,
        "50%": 0.024046,
        "75%": 0.2721,
        "97.5%": 0.77857
      }
    }, {
      "t1": "1",
      "t2": "3",
      "quantiles": {
        "2.5%": -0.086517,
        "25%": 0.23978,
        "50%": 0.3957,
        "75%": 0.55952,
        "97.5%": 0.89359,
      }
    }, {
      "t1": "1",
      "t2": "4",
      "quantiles": {
        "2.5%": -0.12607,
        "25%": 0.10228,
        "50%": 0.21104,
        "75%": 0.32148,
        "97.5%": 0.55872
      }
    }, {
      "t1": "2",
      "t2": "3",
      "quantiles": {
        "2.5%": -0.5303,
        "25%": 0.086932,
        "50%": 0.36788,
        "75%": 0.66446,
        "97.5%": 1.2879
      }
    }, {
      "t1": "2",
      "t2": "4",
      "quantiles": {
        "2.5%": -0.63341,
        "25%": -0.085617,
        "50%": 0.18168,
        "75%": 0.45916,
        "97.5%": 1.0355
      }
    }, {
      "t1": "3",
      "t2": "4",
      "quantiles": {
        "2.5%": -0.61811,
        "25%": -0.32346,
        "50%": -0.18853,
        "75%": -0.053206,
        "97.5%": 0.24573
      }
    }];
  }
});
