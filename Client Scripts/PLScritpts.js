/// <reference path='../typings/XRM/xrm.d.ts' />

var PMS = window.PMS || {};

(function () {
  (this.handleOnLoad = function (executionContext) {
    PMS.handlePermitTypeSettings(executionContext);
    console.log("On load - Permit form");
  }),
    (this.handleOnChange = function (executionContext) {
      console.log("On change - Permit type");
    }),
    (this.handlePermitTypeSettings = function (executionContext) {
      let formContext = executionContext.getFormContext();
      let permitType = formContext.getAttribute("pms_permittype").getValue();

      if (permitType == null) {
        formContext.ui.tabs.get("inspectionsTab").setVisible(false);
        formContext.getAttribute("pms_requiresize").setRequiredLevel("none");
        formContext.ui.controls.get("pms_newsize").setVisible(false);
        return;
      } else {
        let permitTypeId = permitType[0].id;
        Xrm.WebApi.retrieveRecord("pms_permittype", permitTypeId).then(
          (result) => {
            if (result.pms_requireinspection) {
              formContext.ui.tabs.get("inspectionsTab").setVisible(true);
            } else {
              formContext.ui.tabs.get("inspectionsTab").setVisible(false);
            }

            if (result.pms_requiresize) {
              formContext.ui.controls.get("pms_newsize").setVisible(true);
              formContext
                .getAttribute("pms_newsize")
                .setRequiredLevel("required");
            } else {
              formContext.getAttribute("pms_newsize").setRequiredLevel("none");
              formContext.ui.controls.get("pms_newsize").setVisible(false);
            }
          },
          (error) => alert("Error " + error.message)
        );
      }
    }),
    (this.lockPermitRequest = function (permitId, reason) {
      this.entity = { entityType: "pms_permit", id: permitId };
      this.reason = reason;

      this.getMetadata = function () {
        return {
          bounParameter: "entity",
          paramterTypes: {
            entity: {
              typeName: "mscrm.pms_permit",
              structuralProperty: 5,
            },
            Reason: {
              typeName: "Edm.String",
              structuralProperty: 1, // Primitive Type
            },
          },
          operationType: 0, // action. 1 for function, 2 for CRUD
          operationName: "pms_LockPermit",
        };
      };
    }),
    (this.lockPermit = function (primaryControl) {
      formContext = primaryControl;
      let permitId = formContext.data.entity
        .getId()
        .replace("{", "")
        .replace("}", "");
      let lockPermitRequest = new PMS.lockPermitRequest(permitId, "Admin Lock");

      Xrm.WebApi.online.execute(lockPermitRequest).then(
        (result) => {
          if (result.ok) {
            console.log(`status: ${result.status}, ${result.statusText}`);
            formContext.ui.setFormNotification(
              "Status " + result.status,
              "INFORMATION"
            );
          }
        },
        (error) => console.log(error.message)
      );
    });
}).call(PMS);
