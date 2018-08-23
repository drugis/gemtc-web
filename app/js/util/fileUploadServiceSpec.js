'use strict';
define(['angular', 'angular-mocks', 'gemtc-web/util/util'], function(angular) {
  describe('the file upload service', function() {

    var fileUploadService;
    var csvParseServiceStub, problemValidityServiceStub;
    var validCsv = '"study","treatment","mean","std.dev","sampleSize"\n' +
      '"1","A",-1.22,3.7,54\n' +
      '"1","C",-1.53,4.28,95\n' +
      '"2","A",-0.7,3.7,172\n' +
      '"2","B",-2.4,3.4,173\n';

    beforeEach(function() {
      angular.mock.module('gemtc.util', function($provide) {
        csvParseServiceStub = jasmine.createSpyObj('csvParseService', ['parse']);
        problemValidityServiceStub = jasmine.createSpyObj('problemValidityService', ['parse', 'getValidity']);
        $provide.value('CSVParseService', csvParseServiceStub);
        $provide.value('ProblemValidityService', problemValidityServiceStub);
      });
    });

    beforeEach(function() {
      angular.mock.inject(function(FileUploadService) {
        fileUploadService = FileUploadService;
      });
    });

    describe('processFile', function() {

      describe('for valid csv', function() {

        beforeEach(function() {
          var trueResult = {
            isValid: true,
            message: '',
            problem: {
              entries: 'entries',
              treatments: 'treatments'
            }
          };
          csvParseServiceStub.parse.and.returnValue(trueResult);

          problemValidityServiceStub.parse.and.returnValue(trueResult);
          problemValidityServiceStub.getValidity.and.returnValue(trueResult);
        });

        it('should process it', function() {
          var file = {
            extension: 'csv',
            contents: validCsv
          };

          var parseResult = fileUploadService.processFile(file);

          expect(parseResult.isValid).toBe(true);
          expect(parseResult.problem.treatments).toEqual('treatments');
          expect(parseResult.problem.entries).toEqual('entries');
        });
      });
      describe('for valid json', function() {

        beforeEach(function() {
          var trueResult = {
            isValid: true,
            message: '',
            problem: {
              entries: 'entries',
              treatments: 'treatments'
            }
          };
          csvParseServiceStub.parse.and.returnValue(trueResult);

          problemValidityServiceStub.parse.and.returnValue(trueResult);
          problemValidityServiceStub.getValidity.and.returnValue(trueResult);
        });

        it('should process it', function() {
          var file = {
            extension: 'json',
            contents: validCsv
          };

          var parseResult = fileUploadService.processFile(file);

          expect(parseResult.isValid).toBe(true);
          expect(parseResult.problem.treatments).toEqual('treatments');
          expect(parseResult.problem.entries).toEqual('entries');
        });
      });
      describe('for other file types', function() {
        it('should fail', function() {
          var file = {
            extension: 'doc'
          };

          var parseResult = fileUploadService.processFile(file);

          expect(parseResult.isValid).toBe(false);
        });
      });

    });

  });
});
