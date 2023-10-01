var PMS = window.PMS || {};

(function() {


    this.handleOnload = function(executionContext) {
        this.handleOnPermitTypeSettings(executionContext);
        console.log("On load - Permit Form");
    },

    this.handleOnChange = function(executionContext) {
        console.log("On change - Permit Type");
    },

    this.handlePermitTypeSettings = function(executionContext) {
        var formContext = executionContext.getFormContext();
        var permitType = formContext.getAttribute("pms_permittype").getValue();

        if (permitType === null) {
            formContext.ui.tabs.get("inspectionsTab").setVisible(false);
            formContext.getAttribute("pms_requireseize").setRequiredLevel("none");
            formContext.ui.controls.get("pms_newsize"). setVisible(false);
            return;
        }
        else {
            var permitTypeId = permitType[0].id;
            Xrm.WebApi.retrieveRecord("pms_permittype", permitTypeId).then(function(result) {
                if (result.pms_requireinspection) {
                    formContext.ui.tabs.get("inspectionsTab").setVisible(true);
                }
                else {
                    formContext.ui.tabs.get("inspectionsTab").setVisible(false);
                }

                if (result.pms_requiresize) {
                    formContext.ui.controls.get("pms_newsize").setVisible(true);
                    formContext.getAttribute("pms_newsize").setRequiredLevel("required");
                }
                else {
                    formContext.getAttribute("pms_newsize").setRequiredLevel("none");
                    formContext.ui.controls.get("pms_newsize").setVisible(false);
                }
            },
            function(error) {
                alert("Error " + error.message);
            });
        }
    },

    this.lockPermitRequest = function(permitId, reason) {
        this.entity = { entityType: "pms_permit", id: permitId };
        this.reason = reason;

        this.getMetadata = function() {
            return {
                boundParameter: "entity", parameterTpes: {
                    "entity": {
                        typeName: "mscrm.pms_permit",
                        structuralProperty: 5
                    },
                    "Reason": {
                        "typeName": "Edm.String",
                        "structuralProperty": 1
                    }
                },
                operationType: 0,
                operationName: "pms_LockPermit"
            };
        };
    },

    this.lockPermit = function(primaryControl) {
        formContext = primaryControl;
        var permitId = formContext.data.entity.getId().replace("{", "").replace("}", "");
        var lockRequest= new PMS.lockPermitRequest(permitId, "Admin Lock");

        Xrm.WebApi.online.execute(lockRequest).then(function(result) {
            if (result.ok) {
                console.log(`Staus: ${result.status}, text: ${result.statusText}`);
                formContext.ui.setFormNotification("Status " + result.status, "INFORMATION");
            }
        },
        function(error) {
            console.log(error.message);
        }
        );
    };

}).call(PMS);