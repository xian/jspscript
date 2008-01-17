// JsMock, Copyright 2007 by Christian Williams

var JsMock = new Class("JsMock", {
  static: {
    SPECIAL_METHODS: {finalize:"",getClass:"",instanceOf:"",Super:""},

    MockInfo: new Class("MockInfo", {
      initialize: function(myClass) {
        this.myClass = myClass;
        this.events = [];
        this.expectations = [];
      },

      addExpectation: function(expectation) {
        this.expectations.push(expectation);
      },

      matchExpectation: function(functionName, args) {
        var expectation = this.expectations[0];
        if (!expectation._matches(functionName, args))
          throw new Error("expected " + expectation._signature() +
            " but was " + functionName + "(" + args.join(",") + ")");
        this.expectations.shift();
        return expectation.returnValue;
      }
    }),

    Expectation: new Class("Expectation", {
      initialize: function(args) {
        this.functionName = args[0];
        this.arguments = [];
        for (var i = 1; i < args.length; i++) {
          this.arguments.push(args[i]);
        }
        this.occurring = 1;
      },

      returning: function(returnValue) {
        this.returnValue = returnValue;
        return this;
      },

      _matches: function(functionName, args) {
        if (functionName != this.functionName) return false;
        if (args.length != this.arguments.length) return false;
        for (var i = 0; i < args.length; i++) {
          if (args[i] != this.arguments[i]) return false;
        }
        return true;
      },

      _signature: function() {
        return this.functionName + "(" + this.arguments.join(",") + ")";
      }
    }),

    expect: function() {
      var mockInfo = JsMock._currentMock.__mockInfo;
      var expectation = new JsMock.Expectation(arguments);
      mockInfo.addExpectation(expectation);
      return expectation;
    },

    expectNothingMore: function() {
      var mockInfo = JsMock._currentMock.__mockInfo;
      var expectation = new JsMock.Expectation(arguments);
      mockInfo.addExpectation(expectation);
      return expectation;
    },

    validate: function(theMock) {
    },

    events: function(theMock) {
    },

    makeMockFunction: function(theMock, functionName) {
      return function() {
//        this.__mockInfo.events.push("call to " + name);
        var argv = [];
        for (var i = 0; i < arguments.length; i++) argv.push(arguments[i]);
        return theMock.__mockInfo.matchExpectation(functionName, argv);
      }
    }
  },

  initialize: function(myClass, expectScript) {
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
  }
});

JsLikeJava._class_extensions.push(function(theClass) {
  theClass.mock = function(expectScript) {
    return new JsMock(theClass, expectScript);
  }
});
