public with sharing class getContacts {
  @AuraEnabled(cacheable=true)
 public static List<Contact> getcontactrec( String searchKey, String sortBy,String sortDirection) {
    //Query To get Name,Email and Phone From Contact 
     String query = 'SELECT Id, Name,Email,Phone FROM Contact';
   //  system.debug('query---'+query);
     if ( searchKey != null && searchKey != '' ) {
         String key = '%' + searchKey + '%';
         query += ' WHERE Name LIKE :key';
     }
     if ( sortBy != null && sortDirection != null ) {
         query += ' ORDER BY ' + sortBy + ' ' + sortDirection;
     }
     query = query + ' LIMIT 1000';
     return Database.query( query );
 }

 @AuraEnabled
public static void updateRecords(String recordsJson) {
  try {
    List<Contact> cons = (List<Contact>) JSON.deserialize(
      recordsJson,
      List<Contact>.class
   
    );
    system.debug('Cons'+cons);
    update cons;

system.debug('Cons'+cons);
  } catch (Exception e) {
    system.debug('Exception'+e);
    
  }
}
}