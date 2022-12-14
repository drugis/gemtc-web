'use strict';
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;

var queryStub = {
  query: function() {
    console.log('query being called');
  }
};

var dbStub = function() {
  return queryStub;
};

var modelRepository = proxyquire('../standalone-app/modelRepository', {
  './db': dbStub
});

var expectedError = 'error message';
var columnString = 'title, analysisId, linearModel,' +
  ' burn_in_iterations, inference_iterations, ' +
  ' thinning_factor, modelType, likelihood, link,' +
  ' outcome_scale, heterogeneity_prior, regressor,' +
  ' sensitivity, archived, archived_on';

function succesCallback(query, expectedQuery, expectedValues, expectedResult, done) {
  return function(error, result) {
    sinon.assert.calledWith(query, expectedQuery, expectedValues);
    expect(error).to.be.null;
    expect(result).to.deep.equal(expectedResult);
    done();
  };
}

function errorCallback(query, expectedQuery, expectedValues, done) {
  return function(error) {
    sinon.assert.calledWith(query, expectedQuery, expectedValues);
    expect(error).to.equal(expectedError);
    done();
  };
}

describe('the model repository', function() {
  describe('setArchive', function() {
    var query;
    var modelId = 1234;
    var isArchived = true;
    var archivedOn = new Date();
    var expectedQuery = 'UPDATE model SET archived=$2, archived_on=$3  WHERE id = $1';
    var expectedValues = [modelId, isArchived, archivedOn];
    var expectedResult;

    beforeEach(function() {
      query = sinon.stub(queryStub, 'query');
    });

    afterEach(function() {
      query.restore();
    });

    it('should setArchive', function(done) {
      query.onCall(0).yields(null);
      var callback = succesCallback(query, expectedQuery, expectedValues, expectedResult, done);
      modelRepository.setArchive(modelId, isArchived, archivedOn, callback);
    });

    it('should call the callback if an error if an error occurs', function(done) {
      query.onCall(0).yields(expectedError);
      var callback = errorCallback(query, expectedQuery, expectedValues, done);
      modelRepository.setArchive(modelId, isArchived, archivedOn, callback);
    });
  });

  describe('setTitle', function() {
    var query;
    var expectedQuery = 'UPDATE model SET title = $1 WHERE id = $2';
    var expectedResult;
    var modelId = 1;
    var newTitle = 'newTitle';
    var expectedValues = [newTitle, modelId];

    beforeEach(function() {
      query = sinon.stub(queryStub, 'query');
    });

    afterEach(function() {
      query.restore();
    });

    it('should set the title of the model', function(done) {
      query.onCall(0).yields(null);
      var callback = succesCallback(query, expectedQuery, expectedValues, expectedResult, done);
      modelRepository.setTitle(modelId, newTitle, callback);
    });

    it('should call the callback if an error if an error occurs', function(done) {
      query.onCall(0).yields(expectedError);
      var callback = errorCallback(query, expectedQuery, expectedValues, done);
      modelRepository.setTitle(modelId, newTitle, callback);
    });
  });

  describe('setTaskUrl', function() {
    var query;
    var expectedQuery = 'UPDATE model SET taskUrl=$2 WHERE id = $1';
    var expectedResult;
    var modelId = 1;
    var taskUrl = 'taskUrl';
    var expectedValues = [modelId, taskUrl];

    beforeEach(function() {
      query = sinon.stub(queryStub, 'query');
    });

    afterEach(function() {
      query.restore();
    });

    it('should set the task url', function(done) {
      query.onCall(0).yields(null);
      var callback = succesCallback(query, expectedQuery, expectedValues, expectedResult, done);
      modelRepository.setTaskUrl(modelId, taskUrl, callback);
    });

    it('should call the callback if an error if an error occurs', function(done) {
      query.onCall(0).yields(expectedError);
      var callback = errorCallback(query, expectedQuery, expectedValues, done);
      modelRepository.setTaskUrl(modelId, taskUrl, callback);
    });
  });

  describe('findByAnalysis', function() {
    var query;
    var expectedQuery = ' SELECT id, taskUrl, ' + columnString +
      ' FROM model WHERE analysisId=$1';
    var dbResult = {
      rows: [{
        id: 1,
        title: 'title',
        linearmodel: 'linearmodel',
        analysisid: 'analysisid',
        taskurl: 'http://host.com/taskurl',
        modeltype: 'modeltype',
        burn_in_iterations: 'burn_in_iterations',
        inference_iterations: 'inference_iterations',
        thinning_factor: 'thinning_factor',
        likelihood: 'likelihood',
        link: 'link',
        heterogeneity_prior: 'heterogeneity_prior',
        regressor: 'regressor',
        sensitivity: 'sensitivity',
        archived: 'archived',
        archived_on: 'archived_on'
      }]
    };
    var expectedResult = [{
      id: 1,
      title: 'title',
      linearModel: 'linearmodel',
      analysisId: 'analysisid',
      taskUrl: 'http://host.com/taskurl',
      modelType: 'modeltype',
      burnInIterations: 'burn_in_iterations',
      inferenceIterations: 'inference_iterations',
      thinningFactor: 'thinning_factor',
      likelihood: 'likelihood',
      link: 'link',
      heterogeneityPrior: 'heterogeneity_prior',
      regressor: 'regressor',
      sensitivity: 'sensitivity',
      archived: 'archived',
      archivedOn: 'archived_on'
    }];
    var analysisId = 1;
    var expectedValues = [analysisId];

    beforeEach(function() {
      query = sinon.stub(queryStub, 'query');
    });

    afterEach(function() {
      query.restore();
    });

    it('should get models for the analysis', function(done) {
      query.onCall(0).yields(null, dbResult);
      var callback = succesCallback(query, expectedQuery, expectedValues, expectedResult, done);
      modelRepository.findByAnalysis(analysisId, callback);
    });

    it('should call the callback if an error if an error occurs', function(done) {
      query.onCall(0).yields(expectedError);
      var callback = errorCallback(query, expectedQuery, expectedValues, done);
      modelRepository.findByAnalysis(analysisId, callback);
    });
  });

  describe('createModel', function() {
    var query;
    var expectedQuery = ' INSERT INTO model (' + columnString + ') ' +
      ' VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id';
    var analysisId = 1;
    var newModel = {
      title: 'title',
      linearModel: 'linearModel',
      burnInIterations: 'burnInIterations',
      inferenceIterations: 'inferenceIterations',
      thinningFactor: 'thinningFactor',
      modelType: 'modelType',
      likelihood: 'likelihood',
      link: 'link',
      outcomeScale: 'outcomeScale',
      heterogeneityPrior: 'heterogeneityPrior',
      regressor: 'regressor',
      sensitivity: 'sensitivity'
    };
    var expectedValues = [
      newModel.title,
      analysisId,
      newModel.linearModel,
      newModel.burnInIterations,
      newModel.inferenceIterations,
      newModel.thinningFactor,
      newModel.modelType,
      newModel.likelihood,
      newModel.link,
      newModel.outcomeScale,
      newModel.heterogeneityPrior,
      newModel.regressor,
      newModel.sensitivity,
      false,
      null
    ];
    var modelId = 1;
    var expectedResult = modelId;

    beforeEach(function() {
      query = sinon.stub(queryStub, 'query');
    });

    afterEach(function() {
      query.restore();
    });

    it('should call the callback with an id of the newly created model', function(done) {
      var result = {
        rows: [{
          id: modelId
        }
        ]
      };
      query.onCall(0).yields(null, result);
      var callback = succesCallback(query, expectedQuery, expectedValues, expectedResult, done);
      modelRepository.create(analysisId, newModel, callback);
    });

    it('should call the callback if an error if an error occurs', function(done) {
      query.onCall(0).yields(expectedError);
      var callback = errorCallback(query, expectedQuery, expectedValues, done);
      modelRepository.create(analysisId, newModel, callback);
    });
  });

  describe('getModel', function() {
    var query;
    var expectedQuery = ' SELECT id, taskUrl, ' + columnString +
      ' FROM model WHERE id=$1';
    var dbResult = {
      rows: [{
        id: 1,
        title: 'title',
        linearmodel: 'linearmodel',
        analysisid: 'analysisid',
        taskurl: 'http://host.com/taskurl',
        modeltype: 'modeltype',
        burn_in_iterations: 'burn_in_iterations',
        inference_iterations: 'inference_iterations',
        thinning_factor: 'thinning_factor',
        likelihood: 'likelihood',
        link: 'link',
        heterogeneity_prior: 'heterogeneity_prior',
        regressor: 'regressor',
        sensitivity: 'sensitivity',
        archived: 'archived',
        archived_on: 'archived_on'
      }]
    };
    var expectedResult = {
      id: 1,
      title: 'title',
      linearModel: 'linearmodel',
      analysisId: 'analysisid',
      taskUrl: 'http://host.com/taskurl',
      modelType: 'modeltype',
      burnInIterations: 'burn_in_iterations',
      inferenceIterations: 'inference_iterations',
      thinningFactor: 'thinning_factor',
      likelihood: 'likelihood',
      link: 'link',
      heterogeneityPrior: 'heterogeneity_prior',
      regressor: 'regressor',
      sensitivity: 'sensitivity',
      archived: 'archived',
      archivedOn: 'archived_on'
    };
    var modelId = 1;
    var expectedValues = [modelId];

    beforeEach(function() {
      query = sinon.stub(queryStub, 'query');
    });

    afterEach(function() {
      query.restore();
    });

    it('should call the callback with a row-mapped model', function(done) {
      query.onCall(0).yields(null, dbResult);
      var callback = succesCallback(query, expectedQuery, expectedValues, expectedResult, done);
      modelRepository.get(modelId, callback);
    });

    it('should call the callback if an error if an error occurs', function(done) {
      query.onCall(0).yields(expectedError);
      var callback = errorCallback(query, expectedQuery, expectedValues, done);
      modelRepository.get(modelId, callback);
    });
  });

  describe('update', function() {
    var query;
    var expectedQuery = 'UPDATE model SET burn_in_iterations=$2, inference_iterations=$3, thinning_factor=$4, taskUrl=NULL where id = $1';
    var newModel = {
      id: 'id',
      burnInIterations: 'burnInIterations',
      inferenceIterations: 'inferenceIterations',
      thinningFactor: 'thinningFactor'
    };
    var expectedValues = [
      newModel.id,
      newModel.burnInIterations,
      newModel.inferenceIterations,
      newModel.thinningFactor
    ];
    var expectedResult;

    beforeEach(function() {
      query = sinon.stub(queryStub, 'query');
    });

    afterEach(function() {
      query.restore();
    });

    it('should call the callback if successful', function(done) {
      query.onCall(0).yields(null);
      var callback = succesCallback(query, expectedQuery, expectedValues, expectedResult, done);
      modelRepository.update(newModel, callback);
    });

    it('should call the callback if an error if an error occurs', function(done) {
      query.onCall(0).yields(expectedError);
      var callback = errorCallback(query, expectedQuery, expectedValues, done);
      modelRepository.update(newModel, callback);
    });
  });

  describe('delete', function() {
    var query;
    var expectedQuery = 'DELETE FROM model WHERE id = $1';
    var modelId = 1;
    var expectedValues = [modelId];
    var expectedResult;

    beforeEach(function() {
      query = sinon.stub(queryStub, 'query');
    });

    afterEach(function() {
      query.restore();
    });

    it('should delete the model and call the callback', function(done) {
      query.onCall(0).yields(null);
      var callback = succesCallback(query, expectedQuery, expectedValues, expectedResult, done);
      modelRepository.deleteModel(modelId, callback);
    });

    it('should call the callback if an error if an error occurs', function(done) {
      query.onCall(0).yields(expectedError);
      var callback = errorCallback(query, expectedQuery, expectedValues, done);
      modelRepository.deleteModel(modelId, callback);
    });
  });
});
