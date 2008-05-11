// JsMock, Copyright 2007 by Christian Williams

var JsMock = function(myClass, expectScript) {
  this.__mockInfo = new JsMock.MockInfo(myClass);

  for (var item in myClass.prototype) {
    if (JsMock.SPECIAL_METHODS[item] == "") continue;
    this[item] = JsMock.makeMockFunction(this, item);
  }

  // passthrough the JsLikeJava methods...
  this.getClass = myClass.prototype.getClass;
  this.instanceOf = myClass.prototype.instanceOf;

  if (JsMock._currentMock) throw new Error("can't define mocks within mocks");
  JsMock._currentMock = this;
  try {
    expectScript(this);
  }
  finally {
    JsMock._currentMock = null;
  }
};

JsMock.SPECIAL_METHODS = {finalize:"",getClass:"",instanceOf:"",Super:""};

JsMock.MockInfo = function(myClass) {
  this.myClass = myClass;
  this.events = [];
  this.expectations = [];
};

JsMock.MockInfo.prototype = {
  addExpectation: function(expectation) {
    this.expectations.push(expectation);
  },

  matchExpectation: function(functionName, args) {
    var expectation = this.expectations[0];
    if (!expectation) {
      throw new Error("didn't expect " + functionName + "(" + args.join(",") + ")");
    }
    if (!expectation._matches(functionName, args))
      throw new Error("expected " + expectation._signature() +
        " but was " + functionName + "(" + args.join(",") + ")");
    this.expectations.shift();
    return expectation.returnValue;
  }
};

JsMock.Expectation = function(args) {
  this.functionName = args[0];
  this.arguments = [];
  for (var i = 1; i < args.length; i++) {
    this.arguments.push(args[i]);
  }
  this.occurring = 1;
};

JsMock.ANYTHING = {};

JsMock.Expectation.prototype = {
  returning: function(returnValue) {
    this.returnValue = returnValue;
    return this;
  },

  _isEqual: function(left, right) {
    if (right === JsMock.ANYTHING) {
      return true;
    } else if (left instanceof Array && right instanceof Array && left.length == right.length) {
      for (var i = 0; i < left.length; i++) {
        if (!this._isEqual(left[i], right[i])) return false;
      }
      return true;
    } else if (typeof(left) == "object" && typeof(right) == "object") {
      assertHashEquals(left, right);
      return true;
    } else {
      return left == right;
    }
  },

  _matches: function(functionName, args) {
    if (functionName != this.functionName) return false;
    if (args.length != this.arguments.length) return false;
    for (var i = 0; i < args.length; i++) {
      if (!this._isEqual(args[i], this.arguments[i])) return false;
    }
    return true;
  },

  _signature: function() {
    return this.functionName + "(" + this.arguments.join(",") + ")";
  }
};

JsMock.expect = function(method, args) {
  var mockInfo = JsMock._currentMock.__mockInfo;
  var expectation = new JsMock.Expectation(arguments);
  mockInfo.addExpectation(expectation);
  return expectation;
};

JsMock.expectNothingMore = function() {
  var mockInfo = JsMock._currentMock.__mockInfo;
  var expectation = new JsMock.Expectation(arguments);
  mockInfo.addExpectation(expectation);
  return expectation;
};

JsMock.validate = function(theMock) {
  var mockInfo = theMock.__mockInfo;
  if (mockInfo.expectations.length > 0) {
    console.log(mockInfo.expectations);
    throw new Error("unsatisfied expectations remain!");
  }
};

JsMock.events = function(theMock) {
};

JsMock.makeMockFunction = function(theMock, functionName) {
  return function() {
    //        this.__mockInfo.events.push("call to " + name);
    var argv = [];
    for (var i = 0; i < arguments.length; i++) argv.push(arguments[i]);
    return theMock.__mockInfo.matchExpectation(functionName, argv);
  }
};
