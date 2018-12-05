'use strict';
define(['angular', 'angular-mocks', './createModel'], function(angular) {
  describe('The createModelService', function() {
    var createModelService;

    beforeEach(angular.mock.module('gemtc.createModel'));

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
  });
});
