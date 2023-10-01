var PMS = window.PMS || {};

if (typeof PMS === "undefined") {
  PMS = { __namespace: true };
}

if (typeof PMS.Permit === "undefined") {
  PMS.Permit = { __namespace: true };
}

(function() {
  PMS.Permit.Scripts = {
    handleOnLoad: function(executionContext) {
      console.log("on load - permit form");
      this._handlePermitTypeSettings(executionContext);
    },

    handleOnChange: function(executionContext) {
      console.log("on change - permit type");
      this._handlePermitTypeSettings(executionContext);
    },

    _handlePermitTypeSettings: function(executionContext) {
      console.log("handlePermitTypeSettings");
      var formContext = executionContext.getFormContext();
      var permitType = formContext.getAttribute("pms_permittype").getValue();

      if (permitType === null) {
        console.log("permitType null");
        formContext.ui.tabs.get("inspectionsTab").setVisible(false);
        formContext.getAttribute("pms_newsize").setRequiredLevel("none");
        formContext.ui.controls.get("pms_newsize").setVisible(false);
        return;
      } else {
        var permitTypeID = permitType[0]?.id;
        console.log("permitType =" + permitTypeID);
        Xrm.WebApi.retrieveRecord("pms_permittype", permitTypeID).then(
          function(result) {
            if (result.pms_requireinspections) {
              console.log("requireinspections");
              formContext.ui.tabs.get("inspectionsTab").setVisible(true);
            } else {
              console.log("not requireinspections");
              formContext.ui.tabs.get("inspectionsTab").setVisible(false);
            }
            if (result.pms_requiresize) {
              console.log("requiresize");
              formContext.ui.controls.get("pms_newsize").setVisible(true);
              formContext.getAttribute("pms_newsize").setRequiredLevel("required");
            } else {
              console.log("not requiresize");
              formContext.getAttribute("pms_newsize").setRequiredLevel("none");
              formContext.ui.controls.get("pms_newsize").setVisible(false);
            }
          },
          function(error) {
            alert("Error:" + error.message);
          }
        );
      }
    },

    _lockPermitRequest: function(permitID, reason) {
      console.log("_lockPermitRequest");
      this.entity = { entityType: "pms_permit", id: permitID };
      this.Reason = reason;
      this.getMetadata = function() {
        return {
          boundParameter: "entity",
          parameterTypes: {
            entity: {
              typeName: "mscrm.pms_permit",
              structuralProperty: 5
            },
            Reason: {
              typeName: "Edm.String",
              structuralProperty: 1
            }
          },
          operationType: 0,
          operationName: "pms_LockPermit"
        };
      };
    },

    lockPermit: function(primaryControl) {
      console.log("lockPermit");
      var formContext = primaryControl;
      var PermitID = formContext.data.entity.getId().replace("{", "").replace("}", "");
      var lockPermitRequest = new PMS.Permit.Scripts._lockPermitRequest(PermitID, "Admin Lock");

      Xrm.WebApi.online.execute(lockPermitRequest).then(
        function(result) {
          if (result.ok) {
            console.log("Status: %s %s", result.status, result.statusText);
            formContext.ui.setFormNotification("Status " + result.status, "INFORMATION");
          }
        },
        function(error) {
          console.log(error.message);
        }
      );
    },
    __namespace: true
  };
}).call(PMS);
