'use strict';

module.exports = function(pContext) {

  function report(pNode, pType) {
    pContext.report(pNode, "{{type_verbose}} '{{name}}' must be prefixed with '{{type}}'", {
      name: pNode.name,
      type: pType.reduce(function(a, b) {
        return a + ' or ' + b
      }),
      type_verbose: pType.length === 1 ? mCheckTypes[pType[0]] : pType.reduce(function(a, b) {
        return mCheckTypes[a] + ' or ' + mCheckTypes[b]
      })
    });
  }

  function reportLength(pNode, pMinLength) {
    pContext.report(pNode, "'{{name}}' must have a length of {{min}} or more", {
      name: pNode.name,
      min: pMinLength
    });
  }

  function reportWrongChar(pNode) {
    pContext.report(pNode, "The second character of '{{name}}' must be a capital letter or a digit", {
      name: pNode.name
    });
  }

  function getCheckTypeFromScope(pNode) {
    var mName = pNode.name;
    var tScope = pContext.getScope();
    var tCheckType = ['t'];

    function findChildReferences(pScope) {
      var tChildren = pScope.childScopes;
      var tChildScope;
      var tChildVariables;
      var tChildReferences;
      var i, il, j, jl;

      for (i = 0, il = tChildren.length; i < il; i++) {
        tChildScope = tChildren[i];
        tChildVariables = tChildScope.variables;

        for (j = 0, jl = tChildVariables.length; j < jl; j++) {
          if (tChildVariables[j].name === mName) {
            // Redelcared. Abort this branch.
            return;
          }
        }

        tChildReferences = tChildScope.references;

        for (j = 0, jl = tChildReferences.length; j < jl; j++) {
          if (tChildReferences[j].identifier.name === mName) {
            // Found a reference.
            tCheckType = ['m', 'c'];

            return;
          }
        }

        findChildReferences(tChildScope);

        if (tCheckType.indexOf('t') === -1) {
          // We have already found references. Abort.
          return;
        }
      }
    }

    findChildReferences(tScope);

    return tCheckType;
  }

  var mCheckTypes = {
    p: 'Parameter',
    t: 'Local',
    m: 'Member',
    c: 'Closure Variable',
    s: 'Static'
  };

  var mWhitelist = pContext.options[0] ? pContext.options[0].whitelist || [] : [];

  return {
    Identifier: function(pNode) {
      var tName = pNode.name;
      var tParentNode = pNode.parent;
      var tParentType = tParentNode.type;
      var tCheckType = [];
      var tMinLength = 1;

      if (mWhitelist.indexOf(tName) !== -1) {
        return;
      }

      switch (tParentType) {
        case 'FunctionExpression':
        case 'FunctionDeclaration':
          if (tParentNode.id === pNode) {
            return;
          }

          tCheckType = ['p'];
          tMinLength = 2;

          break;
        case 'VariableDeclarator':
          if (tParentNode.id === pNode) {
            if (/^[A-Z]/.test(tName)) {
              // Constants or classes
              return;
            }

            tCheckType = getCheckTypeFromScope(pNode);
            tMinLength = 2;

            break;
          }

          return;
        default:
          return;
      }

      if (tCheckType.length === 0) {
        return;
      }

      if (tCheckType.indexOf(tName.charAt(0)) === -1) {
        if (tCheckType.indexOf('t') !== -1 && tName.length <= 2) {
          // Allow counters
          return;
        }

        report(pNode, tCheckType);

        return;
      }

      if (tName.length < tMinLength) {
        reportLength(pNode, tMinLength);

        return;
      }

      if (tName.charAt(1).match(/[A-Z0-9]/) === null) {
        reportWrongChar(pNode);
      }
    }
  };
};
