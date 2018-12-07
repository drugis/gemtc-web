'use strict';
define(['angular', 'angular-mocks', './createModel'], function(angular) {
  describe('The createModelService', function() {
    var createModelService;
    var analysisService = jasmine.createSpyObj('AnalysisService', [
      'transformProblemToNetwork',
      'isNetworkDisconnected'
    ]);
    beforeEach(angular.mock.module('gemtc.createModel', function($provide) {
      $provide.value('AnalysisService', analysisService);
    }));

    beforeEach(inject(function(CreateModelService) {
      createModelService = CreateModelService;
    }));

    describe('createNodeSplitComparison', function() {
      it('should set the select node split comparison settings', function() {
        var nodeSplitComparison = {
          from: {
            id: 'fromId'
          },
          to: {
            id: 'toId'
          }
        };
        var options = [{
          from: {
            id: 'anotherfromId'
          },
          to: {
            id: 'anothertoId'
          }
        }, {
          from: {
            id: 'fromId'
          },
          to: {
            id: 'toId'
          }
        }];

        var result = createModelService.createNodeSplitComparison(nodeSplitComparison, options);
        expect(result).toEqual(options[1]);
      });

      it('should set the select node split comparison settings to the first option if none is set yet', function() {
        var options = [{
          from: {
            id: 'anotherfromId'
          },
          to: {
            id: 'anothertoId'
          }
        }, {
          from: {
            id: 'fromId'
          },
          to: {
            id: 'toId'
          }
        }];

        var result = createModelService.createNodeSplitComparison(undefined, options);
        expect(result).toEqual(options[0]);
      });

    });
    describe('createPairWiseComparison', function() {
      it('should set the select node split comparison settings', function() {
        var pairWiseComparison = {
          from: {
            id: 'fromId'
          },
          to: {
            id: 'toId'
          }
        };
        var options = [{
          from: {
            id: 'anotherfromId'
          },
          to: {
            id: 'anothertoId'
          }
        }, {
          from: {
            id: 'fromId'
          },
          to: {
            id: 'toId'
          }
        }];

        var result = createModelService.createPairWiseComparison(pairWiseComparison, options);
        expect(result).toEqual(options[1]);
      });

      it('should set the select node split comparison settings to the first option if none is set yet', function() {
        var options = [{
          from: {
            id: 'anotherfromId'
          },
          to: {
            id: 'anothertoId'
          }
        }, {
          from: {
            id: 'fromId'
          },
          to: {
            id: 'toId'
          }
        }];

        var result = createModelService.createNodeSplitComparison(undefined, options);
        expect(result).toEqual(options[0]);
      });
    });

    describe('heterogeneityParamsChange', function() {
      it('should return truey when the prior is automatic ', function() {
        var prior = {
          type: 'automatic'
        };
        var result = createModelService.heterogeneityParamsChange(prior);
        expect(result).toBeTruthy();
      });

      it('should return falsey when the prior has no values ', function() {
        var result = createModelService.heterogeneityParamsChange({});
        expect(result).toBeFalsy();
      });

      it('should return truthy when the prior is a stadard deviaton with a valid value ', function() {
        var prior = {
          type: 'standard-deviation',
          values: {
            lower: 0.1,
            upper: 0.9
          }
        };
        var result = createModelService.heterogeneityParamsChange(prior);
        expect(result).toBeTruthy();
      });
      it('should return falsy when the prior is a stadard deviaton with a valid value ', function() {
        var prior = {
          type: 'standard-deviation',
          values: {
            lower: -0.1,
            upper: 0.9
          }
        };
        var result = createModelService.heterogeneityParamsChange(prior);
        expect(result).toBeFalsy();
      });
      it('should return truthy when the prior is variance, and has a value >= 0 ', function() {
        var prior = {
          type: 'variance',
          values: {
            stdDev: 1
          }
        };
        var result = createModelService.heterogeneityParamsChange(prior);
        expect(result).toBeTruthy();
      });
      it('should return truthy when the prior is variance, and has a value < 0 ', function() {
        var prior = {
          type: 'variance',
          values: {
            stdDev: -1
          }
        };
        var result = createModelService.heterogeneityParamsChange(prior);
        expect(result).toBeFalsy();
      });
      it('should return truthy when the prior is precision and has a valid rate and shape ', function() {
        var prior = {
          type: 'precision',
          values: {
            rate: 1,
            shape: 0.5
          }
        };
        var result = createModelService.heterogeneityParamsChange(prior);
        expect(result).toBeTruthy();
      });
      it('should return falsy when the prior is precision and has an invalid rate or shape ', function() {
        var prior = {
          type: 'precision',
          values: {
            rate: -1,
            shape: 0.5
          }
        };
        var result = createModelService.heterogeneityParamsChange(prior);
        expect(result).toBeFalsy();
      });
    });
    describe('createLikelihoodLink', function() {
      it('should set the first valid likelihood if none has been set yet', function() {
        var options = [{
          some: 'options',
          compatibility: 'compatible'
        }];
        var result = createModelService.createLikelihoodLink(undefined, options);
        expect(result).toEqual(options[0]);
      });
      it('should leave the likelihood unset if none has been set and there is no valid one', function() {
        var options = [{ some: 'options' }];
        var result = createModelService.createLikelihoodLink(undefined, options);
        expect(result).toEqual(undefined);
      });
      it('should set the correct link options for the set likelihood', function() {
        var likelihoodLink = {
          link: 'a link',
          likelihood: 'likely'
        };
        var options = [{
          link: 'a link',
          likelihood: 'likely',
          some: 'options'
        }];
        var result = createModelService.createLikelihoodLink(likelihoodLink, options);
        expect(result).toEqual(options[0]);
      });
    });
    describe('buildCovariateOptions', function() {
      it('should a list of possible covariates for absolute data', function() {
        var problem = {
          entries: [{ study: 'study1' }],
          studyLevelCovariates: {
            study1: {
              age: {},
              sex: {}
            }
          }
        };
        var result = createModelService.buildCovariateOptions(problem);
        var expectedResult = ['age', 'sex'];
        expect(result).toEqual(expectedResult);
      });
      it('should a list of possible covariates for relative data', function() {
        var problem = {
          entries: [],
          relativeEffectData: {
            data: {
              study1: {},
              study2: {}
            }
          },
          studyLevelCovariates: {
            study1: {
              age: {},
              sex: {}
            }
          }
        };
        var result = createModelService.buildCovariateOptions(problem);
        var expectedResult = ['age', 'sex'];
        expect(result).toEqual(expectedResult);
      });
    });
    describe('getModelWithCovariates', function() {
      it('should return a model with a covariateOption and metaRegressionControl set when they werent', function() {
        var model = {};
        var problem = {
          treatments: ['treatment1']
        };
        var covariateOptions = ['option1', 'option2'];
        var result = createModelService.getModelWithCovariates(model, problem, covariateOptions);
        var expectedResult = {
          covariateOption: 'option1',
          metaRegressionControl: 'treatment1'
        };
        expect(result).toEqual(expectedResult);
      });
      it('should return a model with an unchanged covariateOption and metaRegressionControl set to the matching treatment', function() {
        var model = {
          covariateOption: 'option3',
          metaRegressionControl: {
            id: 'treatment1',
            some: 'thing'
          }
        };
        var problem = {
          treatments: [{ id: 'treatment1' }]
        };
        var covariateOptions = ['option1', 'option2'];
        var result = createModelService.getModelWithCovariates(model, problem, covariateOptions);
        var expectedResult = {
          covariateOption: 'option3',
          metaRegressionControl: { id: 'treatment1' }
        };
        expect(result).toEqual(expectedResult);
      });
    });

    describe('createLeaveOneOutOptions', function() {
      var result;
      var problem = {
        entries: [{
          study: 'Study1',
          treatment: 1,
          responders: 58,
          sampleSize: 100
        }, {
          study: 'Study1',
          treatment: 2,
          responders: 53,
          sampleSize: 103
        }, {
          study: 'Study2',
          treatment: 1,
          responders: 54,
          sampleSize: 99
        }, {
          study: 'Study2',
          treatment: 2,
          responders: 90,
          sampleSize: 109
        }, {
          study: 'Study3',
          treatment: 2,
          responders: 54,
          sampleSize: 99
        }]
      };
      beforeEach(function() {
        result = createModelService.createLeaveOneOutOptions(problem);
        analysisService.isNetworkDisconnected.and.returnValues(true);
      });

      it('should create the options for leave one out sensitivity analysis from the problem', function() {
        var expectedResult = ['Study1', 'Study2', 'Study3'];
        expect(result).toEqual(expectedResult);
      });
    });

    describe('createPairwiseOptions', function() {
      var network = {
        edges: [{
          from: { name: 'name1' },
          to: { name: 'name2' },
          studies: [
            { id: 1 }, { id: 2 }
          ]
        }, {
          from: { name: 'name3' },
          to: { name: 'name4' },
          studies: [
            { id: 3 }, { id: 4 }
          ]
        }, {
          from: { name: 'name5' },
          to: { name: 'name6' },
          studies: [
            { id: 5 }
          ]
        }]
      };

      beforeEach(function() {
        analysisService.transformProblemToNetwork.and.returnValue(network);
      });

      it('should create the options for pairwise comparisons from the problem', function() {
        var problem = { id: 1 };
        var result = createModelService.createPairwiseOptions(problem);
        var expectedResult = [{
          label: 'name1 - name2',
          from: { name: 'name1' },
          to: { name: 'name2' },
          studies: [
            { id: 1 }, { id: 2 }
          ]
        }, {
          label: 'name3 - name4',
          from: { name: 'name3' },
          to: { name: 'name4' },
          studies: [
            { id: 3 }, { id: 4 }
          ]
        }];
        expect(result).toEqual(expectedResult);
      });
    });

  });
});
