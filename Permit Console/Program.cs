using System.ServiceModel;
using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Microsoft.Xrm.Tooling.Connector;

using CrmEarlyBound;



Console.WriteLine("Permit Console -- PL 400 Github Labs");

string connectionString = @$"AuthType=OAuth; Username=sp@0ks63.onmicrosoft.com; 
                            Password=Sangay1987;url=https://pldevelopment.crm.dynamics.com/; AppId=51f81489-12ee-4a9e-aaae-a2591f45987d;
                            RedirectUri=app://58145B91-0C36-4500-8554-080854F2AC97; LoginPrompt=Auto";

try
{
    Console.WriteLine("Connect using XRM Tooling");
    CrmServiceClient crmSvc = new CrmServiceClient(connectionString);

    if (crmSvc.IsReady)
    {
        Console.WriteLine("Connected...");
    }
    else 
    {
        throw new Exception("Failed to connect");
    }

    

     Console.WriteLine("Version={0}", crmSvc.ConnectedOrgUniqueName);
            Console.WriteLine("System User Display Name = {0}", crmSvc.GetEntityDisplayName("systemuser"));
            Console.WriteLine($"Org Name: {crmSvc.ConnectedOrgFriendlyName}");

            Console.WriteLine("Retrieve current user");
            Guid currentuserid = ((WhoAmIResponse)crmSvc.Execute(new WhoAmIRequest())).UserId;
            Entity systemUser = (Entity)crmSvc.Retrieve("systemuser", currentuserid, new ColumnSet(new string[] { "firstname", "lastname" }));
            Console.WriteLine("Logged on user is {0} {1}.", systemUser["firstname"], systemUser["lastname"]);

            // Data Operations
            Console.WriteLine("Create Permit");
            pms_Permit newPermit = new pms_Permit();
            newPermit.pms_Name = "Organization Service Permit";
            newPermit.pms_NewSize = 1000;
            newPermit.pms_StartDate = DateTime.Now;
            Guid permitId = crmSvc.Create(newPermit);
            Console.WriteLine($"Permit: {permitId.ToString()}");

            Console.WriteLine("Retrieving inspections...");
            QueryExpression inspectionQuery = new()
            {
                EntityName = pms_Inspection.EntityLogicalName,
                ColumnSet = new ColumnSet("pms_permit", "pms_name")
            };
            inspectionQuery.Criteria.AddCondition("statuscode", ConditionOperator.Equal, (int)pms_Inspection_StatusCode.Pending);
            inspectionQuery.Distinct = true;

            EntityCollection inspections = crmSvc.RetrieveMultiple(inspectionQuery);
            Console.WriteLine($"Number of Pending inspections: {inspections.Entities.Count.ToString()}");

            foreach (pms_Inspection inspection in inspections.Entities)
            {
                EntityReference permit = inspection.pms_Permit;
                Console.WriteLine($"Permit ID: {permit.Id.ToString()}, Permit Name: {permit.Name}, Inspection: {inspection.pms_Name}");
            }




            Console.WriteLine("Permit console : End");
            // Pause the console so it does not close.
            Console.WriteLine("Press the <Enter> key to exit.");
            Console.ReadLine();
}
catch (FaultException<OrganizationServiceFault> ex)
    {
        Console.WriteLine("Error: {0}", ex.Message);
    }
catch (Exception ex)
    {
         Console.WriteLine("Error: {0}", ex.Message);
    }

