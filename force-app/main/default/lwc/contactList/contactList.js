import { LightningElement, wire, api, track} from 'lwc';
    import { refreshApex } from '@salesforce/apex';
    import getcontactrec from '@salesforce/apex/getContacts.getcontactrec';
    import updateRecords from '@salesforce/apex/getContacts.updateRecords';
    import { ShowToastEvent } from "lightning/platformShowToastEvent";
    import { createRecord } from 'lightning/uiRecordApi';

  const columns = [{
            label: 'Name',
            fieldName: 'Name',
            sortable: true
        },
        {
            label: 'Email',
            fieldName: 'Email',
            editable: true,
            sortable: true
        },
        {
            label: 'Phone',
            fieldName: 'Phone',
            editable: true,
            sortable: true
        }
    ];

    export default class LightningDatatableExample extends LightningElement {
        @track value;
        @track error;
        @track data;
        @api sortedDirection = 'asc';
        @api sortedBy = 'Name';
        @api searchKey = '';
        result;
        @track allSelectedRows = [];
        @track page = 1; 
        @track items = []; 
        @track data = []; 
        @track columns; 
        @track startingRecord = 1;
        @track endingRecord = 0; 
        @track pageSize = 5; 
        @track totalRecountCount = 0;
        @track totalPage = 0;
        isPageChanged = false;
        initialLoad = true;
        dataToRefresh;
                
        strFirstName;
        strLastName;
        strEmail;
        strPhone;  

        @track showText = false;
        showHandler() {
            this.showText = true;
        }

        @track isShowModal = false;

         showModalBox() {  
          this.isShowModal = true;
            }

         hideModalBox() {  
         this.isShowModal = false;
            }
            //Tracking Create Contact Record Fields
        nameChangedHandler(event){
          this.strName = event.target.value;
            }
        lastnameChangedHandler(event){
          this.strLastName = event.target.value;
            }
         emailChangedHandler(event){
           this.strEmail = event.target.value;
            }
         phoneChangedHandler(event){
           this.strPhone = event.target.value;
            }
          
         //Search Function    
        @wire(getcontactrec, {searchKey: '$searchKey', sortBy: '$sortedBy', sortDirection: '$sortedDirection'} )wiredContacts(value){
             this.dataToRefresh = value;
            const {data, error} = value;
           if (data) {    
          this.processRecords(data);
                this.error = undefined;
              } else if (error) {
                this.error = error;
                this.Storerecords = undefined;
            }
        }
    //Update Function
    async updateSelectedRecords(event) {
        let draftValues = this.template.querySelector('lightning-datatable').draftValues;
     try {
          await updateRecords({ recordsJson: JSON.stringify(draftValues) });
        this.clearDraftValues();
        this.showSuccessMessage();
         this.refreshApex();
          } catch (error) {
        this.showError(error);
        }
  
    } 
    //Refresh Function to get fresh Data  
    refreshApex(){
        //return refreshApex(this.data);
          refreshApex(this.dataToRefresh);
     }
    
     //Clear Draft Values Function
    clearDraftValues() {
        const datatable = this.template.querySelector("lightning-datatable");
        if (datatable) {
        datatable.draftValues = null;
        }
    }
    //Show Error Function
    showError(error) {
        this.toggleIsLoading();
        this.error = error;
    }

    //Show Success Function
    showSuccessMessage() {
        this.dispatchEvent(
        new ShowToastEvent({
            title: "Success",
            message: "Contacts were successfully updated",
            variant: "success"
        })
        );
    }
        //Show Data in Data Table Function
       processRecords(data){
                    this.items = data;
                    this.totalRecountCount = data.length; 
                    this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); 
                    
                    this.data = this.items.slice(0,this.pageSize); 
                    this.endingRecord = this.pageSize;
                    this.columns = columns;
            }
            
             //Dynamic Search In DataTable Function
            handleKeyChange( event ) {
                this.searchKey = event.target.value;
                var data = [];
                for(var i=0; i<this.items.length;i++){
                    if(this.items[i]!= undefined && this.items[i].Name.includes(this.searchKey)){
                        data.push(this.items[i]);
                    }
                }
                this.processRecords(data);
            }
        

            //clicking on previous button this method will be called
        previousHandler() {
            this.isPageChanged = true;
            if (this.page > 1) {
                this.page = this.page - 1; //decrease page by 1
                this.displayRecordPerPage(this.page);
            }

        }

        //clicking on next button this method will be called
        nextHandler() {
            this.isPageChanged = true;
            if((this.page<this.totalPage) && this.page !== this.totalPage){
                this.page = this.page + 1; //increase page by 1
                this.displayRecordPerPage(this.page);            
            }
        
        }

        //this method displays records page by page
        displayRecordPerPage(page){

            this.startingRecord = ((page -1) * this.pageSize) ;
            this.endingRecord = (this.pageSize * page);

            this.endingRecord = (this.endingRecord > this.totalRecountCount) 
                                ? this.totalRecountCount : this.endingRecord; 

            this.data = this.items.slice(this.startingRecord, this.endingRecord);
            this.startingRecord = this.startingRecord + 1;
        }    
        //This method will sort columns
        sortColumns( event ) {
            this.sortedBy = event.detail.fieldName;
            this.sortedDirection = event.detail.sortDirection;
            return refreshApex(this.result);
            
        } 

    // These Change handlers to handle the input values on UI 
    createContactRecord(){
    // Creating mapping of fields of Account with values
    var fields = {'FirstName' : this.strName, 'LastName' : this.strLastName, 'Email' : this.strEmail, 'Phone' : this.strPhone};
      // Record details to pass to create method with api name of Object.
    var objectRecordInput = {'apiName' : 'Contact', fields};
    // LDS method to create record.
    createRecord(objectRecordInput).then(response => {
       // alert('Contact Record created with Id: ' +response.id);
        this.showCreatedMessage();
        this.hideModalBox();
     }).catch(error => {
        alert('Error: ' +JSON.stringify(error));
    });
    }

    showCreatedMessage() {
    this.dispatchEvent(
    new ShowToastEvent({
        title: "Success",
        message: "Contacts Created Successfully",
        variant: "success"
    })
    );
    }

  }