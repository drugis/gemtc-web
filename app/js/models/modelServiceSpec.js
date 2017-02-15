'use strict';
define(['angular', 'angular-mocks', 'services'], function() {
  describe('the model service', function() {
    beforeEach(module('gemtc.models'));

    var modelService;

    beforeEach(inject(function(ModelService) {
      modelService = ModelService;
    }));

    describe('cleanModel', function() {
      var frontEndModel, cleanedModel;

      beforeEach(function() {
        frontEndModel = {
          linearModel: 'random',
          modelType: {
            mainType: 'network'
          },
          title: 'modelTitle',
          burnInIterations: 5000,
          inferenceIterations: 20000,
          thinningFactor: 10,
          likelihoodLink: {
            likelihood: 'likelihood',
            link: 'link'
          },
          outcomeScale: {
            type: 'heuristically'
          },
          heterogeneityPrior: {
            type: 'automatic'
          },
          leaveOneOut: {
            isSelected: true,
            omittedStudy: 'study1'
          }
        };
        cleanedModel = {
          linearModel: 'random',
          modelType: {
            type: 'network'
          },
          title: 'modelTitle',
          burnInIterations: 5000,
          inferenceIterations: 20000,
          thinningFactor: 10,
          likelihood: 'likelihood',
          link: 'link',
          sensitivity: {
            omittedStudy: 'study1'
          }
        };
      });

      it('should clean a random-effects network front-end model with automatic heterogeneityPrior', function() {
        expect(modelService.cleanModel(frontEndModel)).toEqual(cleanedModel);
      });

      it('should clean a random-effects node-splitting model where heterogeneityPrior has been set', function() {
        frontEndModel.modelType = {
          mainType: 'node-split'
        };
        frontEndModel.nodeSplitComparison = {
          from: {
            id: 1,
            name: 'fromName'
          },
          to: {
            id: 2,
            name: 'toName'
          }
        };
        frontEndModel.heterogeneityPrior = {
          type: 'standard-deviation',
          values: {
            lower: 0.1,
            upper: 0.2,
          }
        };

        cleanedModel.modelType = {
          type: 'node-split',
          details: {
            from: {
              id: 1,
              name: 'fromName'
            },
            to: {
              id: 2,
              name: 'toName'
            }
          }
        };
        cleanedModel.heterogeneityPrior = {
          type: 'standard-deviation',
          values: {
            lower: 0.1,
            upper: 0.2,
          }
        };
        expect(modelService.cleanModel(frontEndModel)).toEqual(cleanedModel);
      });

      it('should clean a random-effects pairwise model where the outcomeScale has been set', function() {
        frontEndModel.modelType = {
          mainType: 'pairwise'
        };
        frontEndModel.pairwiseComparison = {
          from: {
            id: 1
          },
          to: {
            id: 2
          }
        };
        frontEndModel.outcomeScale = {
          type: 'fixed',
          value: 123456
        };

        cleanedModel.modelType = {
          details: {
            from: {
              id: 1
            },
            to: {
              id: 2
            }
          },
          type: 'pairwise'
        };
        cleanedModel.outcomeScale = 123456;
        expect(modelService.cleanModel(frontEndModel)).toEqual(cleanedModel);
      });

      it('should clean a binary regression model', function() {
        frontEndModel.modelType = {
          mainType: 'regression'
        };
        frontEndModel.covariateOption = 'COVARIATE';
        frontEndModel.metaRegressionControl = {
          id: 1
        };
        frontEndModel.treatmentInteraction = 'unrelated';
        frontEndModel.levels = [0, 1];

        cleanedModel.modelType = {
          type: 'regression',
        };
        cleanedModel.regressor = {
          variable: 'COVARIATE',
          coefficient: 'unrelated',
          control: '1',
          levels: [0, 1]
        };


        expect(modelService.cleanModel(frontEndModel)).toEqual(cleanedModel);
      });
      it('should clean a non-binary regression model with defined levels', function() {
        frontEndModel.modelType = {
          mainType: 'regression'
        };
        frontEndModel.covariateOption = 'COVARIATE';
        frontEndModel.metaRegressionControl = {
          id: 1
        };
        frontEndModel.treatmentInteraction = 'unrelated';
        frontEndModel.levels = [10, 20, 30];

        cleanedModel.modelType = {
          type: 'regression',
        };
        cleanedModel.regressor = {
          variable: 'COVARIATE',
          coefficient: 'unrelated',
          control: '1',
          levels: [10, 20, 30]
        };


        expect(modelService.cleanModel(frontEndModel)).toEqual(cleanedModel);
      });
    });

    describe('toFrontEnd', function() {
      it('should change the backend model to frontend structure', function() {

      });
      it('should roundtrip', function() {
        var backendModel = {
          'id': 211,
          'title': 'test',
          'linearModel': 'random',
          'analysisId': 109,
          'taskUrl': null,
          'modelType': {
            'type': 'network'
          },
          'burnInIterations': 5000,
          'inferenceIterations': 20000,
          'thinningFactor': 10,
          'likelihood': 'binom',
          'link': 'logit',
          'regressor': null,
          'sensitivity': null
        };
        expect(modelService.cleanModel(modelService.toFrontEnd(backendModel))).toEqual(backendModel);
      });
    });

    describe('getBinaryCovariateNames', function() {
      var problem = {
        'studyLevelCovariates': {
          'Alves et al, 1999': {
            'BLINDING_AT_LEAST_DOUBLE_BLIND': 1.0,
            'LENGTH_OF_FOLLOW_UP': 30.0,
            'MULTI_CENTER_STUDY': 1.0
          },
          'Boyer et al, 1998': {
            'BLINDING_AT_LEAST_DOUBLE_BLIND': 1.0,
            'LENGTH_OF_FOLLOW_UP': 30.0,
            'MULTI_CENTER_STUDY': 1.0
          },
          'Behnke et al, 2003': {
            'BLINDING_AT_LEAST_DOUBLE_BLIND': 1.0,
            'LENGTH_OF_FOLLOW_UP': 30.0,
            'MULTI_CENTER_STUDY': 1.0
          }
        }
      };
      it('filter the problem covariates and return only the binary ones', function() {
        var binaryCovariates = modelService.getBinaryCovariateNames(problem);
        expect(binaryCovariates).toEqual(['BLINDING_AT_LEAST_DOUBLE_BLIND',
          'MULTI_CENTER_STUDY'
        ]);
      });
    });

    describe('isProblemWithCovariates', function() {
      it('should return true if the problem has covariates', function() {
        var problem = {
          studyLevelCovariates: {
            'Alves et al, 1999': {
              'BLINDING_AT_LEAST_DOUBLE_BLIND': 1.0,
              'LENGTH_OF_FOLLOW_UP': 30.0,
              'MULTI_CENTER_STUDY': 1.0
            },
            'Boyer et al, 1998': {
              'BLINDING_AT_LEAST_DOUBLE_BLIND': 1.0,
              'LENGTH_OF_FOLLOW_UP': 30.0,
              'MULTI_CENTER_STUDY': 1.0
            },
            'Behnke et al, 2003': {
              'BLINDING_AT_LEAST_DOUBLE_BLIND': 1.0,
              'LENGTH_OF_FOLLOW_UP': 30.0,
              'MULTI_CENTER_STUDY': 1.0
            }
          }
        };
        expect(modelService.isProblemWithCovariates(problem)).toBe(true);
      });
      it('should return false if the problem has no covariates', function() {
        var problem = {
          entries: [{}],
          studyLevelCovariates: {
            'Alves et al, 1999': {},
            'Boyer et al, 1998': {},
            'Behnke et al, 2003': {}
          }
        };
        expect(modelService.isProblemWithCovariates(problem)).toBe(false);
      });
    });

    describe('getCovariateBounds', function() {
      it('should return upper and lover bounds for the given covariate', function() {
        var problem = {
          studyLevelCovariates: {
            'Alves et al, 1999': {
              'LENGTH_OF_FOLLOW_UP': 30.0
            },
            'Boyer et al, 1998': {
              'LENGTH_OF_FOLLOW_UP': -1
            },
            'Behnke et al, 2003': {
              'LENGTH_OF_FOLLOW_UP': 30.0
            }
          }
        };
        expect(modelService.getCovariateBounds('LENGTH_OF_FOLLOW_UP', problem)).toEqual({
          min: -1,
          max: 30
        });
      });

      it('should handle missing values', function() {
        var problem = {
          studyLevelCovariates: {
            'Alves et al, 1999': {
              'LENGTH_OF_FOLLOW_UP': 30.0
            },
            'Boyer et al, 1998': {
              'LENGTH_OF_FOLLOW_UP': null
            },
            'Behnke et al, 2003': {
              'LENGTH_OF_FOLLOW_UP': -5.0
            }
          }
        };
        expect(modelService.getCovariateBounds('LENGTH_OF_FOLLOW_UP', problem)).toEqual({
          min: -5,
          max: 30
        });
      });

      it('should work for a a single value with missing values', function() {
        var problem = {
          studyLevelCovariates: {
            'Alves et al, 1999': {
              'LENGTH_OF_FOLLOW_UP': 30.0
            },
            'Boyer et al, 1998': {
              'LENGTH_OF_FOLLOW_UP': null
            }
          }
        };
        expect(modelService.getCovariateBounds('LENGTH_OF_FOLLOW_UP', problem)).toEqual({
          min: 30,
          max: 30
        });

      });

      it('should handle missing covariates', function() {
        var problem = {
          studyLevelCovariates: {
            'Alves et al, 1999': {},
            'Boyer et al, 1998': {},
            'Behnke et al, 2003': {}
          }
        };
        expect(modelService.getCovariateBounds('LENGTH_OF_FOLLOW_UP', problem)).toEqual({
          min: undefined,
          max: undefined
        });
      });
    });

    describe('createLeaveOneOutBatch', function() {
      it('should create list of models for each leaveOneOutOption', function() {
        var model = {
          title: 'copyMe',
          leaveOneOut: {}
        };
        var leaveOneOutOptions = ['study1', 'study2'];
        var expectedResult = [{
          title: 'copyMe (without study1)',
          leaveOneOut: {
            omittedStudy: 'study1'
          }
        }, {
          title: 'copyMe (without study2)',
          leaveOneOut: {
            omittedStudy: 'study2'
          }
        }];
        var result = modelService.createLeaveOneOutBatch(model, leaveOneOutOptions);
        expect(result.size).toEqual(result.size);
        expect(result).toEqual(expectedResult);
      });
    });

    describe('createModelBatch', function() {
      it('should create a pairwise batch', function() {
        var modelBase = {
          title: 'pairwise base',
          modelType: {
            mainType: 'pairwise'
          }
        };
        var option1 = {
          from: {
            name: 'parox'
          },
          to: {
            name: 'fluox'
          }
        };
        var option2 = {
          from: {
            name: 'fluox'
          },
          to: {
            name: 'sertra'
          }
        }
        var comparisonOptions = [option1, option2];
        var expectedResult = [{
          title: 'pairwise base (parox - fluox)',
          modelType: {
            mainType: 'pairwise'
          },
          pairwiseComparison: option1
        }, {
          title: 'pairwise base (fluox - sertra)',
          modelType: {
            mainType: 'pairwise'
          },
          pairwiseComparison: option2
        }];

        var result = modelService.createModelBatch(modelBase, comparisonOptions, null);

        expect(result).toEqual(expectedResult);
      });
      it('should create a nodesplit batch', function() {
        var modelBase = {
          title: 'nodesplit base',
          modelType: {
            mainType: 'node-split'
          }
        };
        var option1 = {
          from: {
            name: 'parox'
          },
          to: {
            name: 'fluox'
          }
        };
        var option2 = {
          from: {
            name: 'fluox'
          },
          to: {
            name: 'sertra'
          }
        }
        var nodeSplitOptions = [option1, option2];
        var expectedResult = [{
          title: 'nodesplit base (parox - fluox)',
          modelType: {
            mainType: 'node-split'
          },
          nodeSplitComparison: option1
        }, {
          title: 'nodesplit base (fluox - sertra)',
          modelType: {
            mainType: 'node-split'
          },
          nodeSplitComparison: option2
        }];

        var result = modelService.createModelBatch(modelBase, null, nodeSplitOptions);

        expect(result).toEqual(expectedResult);
      });
    });

    describe('isVariableBinary', function() {
      it('should return whether the variable is binary', function() {
        var covariateName = 'age';
        var binaryProblem = {
          studyLevelCovariates: [{
            age: 1
          }, {
            age: 0,
            sex: 'm'
          }]
        };
        var nonBinaryProblem = {
          studyLevelCovariates: [{
            age: 11
          }, {
            age: 92,
            sex: 'm'
          }]
        };
        expect(modelService.isVariableBinary(covariateName, binaryProblem)).toBeTruthy();
        expect(modelService.isVariableBinary(covariateName, nonBinaryProblem)).toBeFalsy();
      });
    });

    describe('nameRankProbabilities', function() {
      it('should replace the id keys with the names of the matching treatment', function() {
        var data = {
          1: 'klaas',
          2: 'henk'
        };
        var treatments = [{
          id: 1,
          name: 'jan'
        }, {
          id: 2,
          name: 'piet'
        }];

        var expectedResult = {
          jan: 'klaas',
          piet: 'henk'
        };

        var result = modelService.nameRankProbabilities(data, treatments);
        expect(result).toEqual(expectedResult);
      });
    });

    describe('addLevelandProcessData', function() {
      it('should call the supplied function for the data & add the level', function() {
        var expectedResult = [{
          level: 'level1',
          data: {
            fluox: [0.2205, 0.739, 0.0405],
            parox: [4, 5, 6]
          }
        }, {
          level: 'level2',
          data: {
            fluox: [0.19512, 0.49938, 0.3055],
            parox: [1, 2, 3]
          }
        }];
        var rankProbabilities = {
          level1: {
            322: [0.2205, 0.739, 0.0405],
            323: [4, 5, 6]
          },
          level2: {
            322: [0.19512, 0.49938, 0.3055],
            323: [1, 2, 3]
          }
        };
        var treatments = [{
          id: 322,
          name: 'fluox'
        }, {
          id: 323,
          name: 'parox'
        }];
        var result = modelService.addLevelandProcessData(rankProbabilities, treatments, modelService.nameRankProbabilities);
        expect(result).toEqual(expectedResult);
      });
    });

    describe('selectLevel', function() {
      it('should work for a binary covariate in a regression model', function() {
        var levelCentering = {
          level: 'centering'
        };
        var level0 = {
          level: 0
        };
        var level1 = {
          level: 1
        };
        var regressor = {
          levels: [],
          variable: 'isCool'
        };
        var binaryProblem = {
          studyLevelCovariates: [{
            isCool: 1
          }]
        };
        var data = [level0, level1, levelCentering];
        var resultRegressor = null;
        var expectedResult = {
          all: [level0, level1],
          selected: level0
        };
        var result = modelService.selectLevel(regressor, binaryProblem, data, resultRegressor);
        expect(result).toEqual(expectedResult);
      });

      it('should work for a nonbinary covariate in a regression model', function() {
        var levelCentering = {
          level: 'centering'
        };
        var level100 = {
          level: 100
        };
        var regressor = {
          levels: [],
          variable: 'aher'
        };
        var nonBinaryProblem = {
          studyLevelCovariates: [{
            aher: 3.7
          }]
        };
        var data = [levelCentering, level100];
        var resultRegressor = {
          modelRegressor: {
            mu: 37
          }
        };
        var expectedResult = {
          all: [levelCentering, level100],
          selected: {
            level: 'centering (37)'
          }
        };
        var result = modelService.selectLevel(regressor, nonBinaryProblem, data, resultRegressor);
        expect(result).toEqual(expectedResult);
      });
      
      it('should work for a non-regression model', function() {
        var levelCentering = {
          level: 'centering'
        };
        var data = [levelCentering];
        var expectedResult = {
          all: [levelCentering],
          selected: levelCentering
        };
        var result = modelService.selectLevel(null, null, data, null);
        expect(result).toEqual(expectedResult);
      });
    });
  });
});
