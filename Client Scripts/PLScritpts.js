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
        return;
      } else {
        let permitTypeId = permitType[0].id;
        Xrm.WebApi.retrieveRecord("pms_permittype", permitTypeId).then(
          (result) => {
            if (result.pms_requireinspections) {
              formContext.ui.tabs.get("inspectionsTab").setVisible(true);
            } else {
              formContext.ui.tabs.get("inspectionsTab").setVisible(true);
            }
          },
          (error) => alert("Error " + error.message)
        );
      }
    });
}).call(PMS);
