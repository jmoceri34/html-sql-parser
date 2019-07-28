
// Function: For errors that pertain to the parser as a whole,
// not a specific area of it
function generalError(message){

	$('#table_errors ul').text('');
	$('#table_errors ul').append('<li>' + message + '</li>');
	$('#output_table').text('');

}

/*
*************
|START| Create Table Functions
*************
*/

// Function: Takes in an error message, hides the appropriate pieces on the
// webpage and posts the message
function tableError(message){
	
	$('#table_errors ul').text('');
	$('#table_errors ul').append('<li>' + message + '</li>');
	$('#table_information').hide();
	$('#table_area').text('');

}

// Function: Takes in the current index and the next index to check if 
// commas are placed correctly. Send the relating message back to the page
// if necessary.
function tableCommaCheck(current, next, count){
	
	// If the next index isn't a closing parenthese
	if(next !== ')'){
		
		// Then check if this index is missing a comma
		if(current.indexOf(',') === -1){
			tableError('You forgot to put a comma on column declaration #' + (count+1) + '.');
		}
		
		// Otherwise, check if you have too many commas on this index 
		else if(current.split(',').length-1 > 1){
			tableError('You have too many commas on column declaration #' + (count+1) + '.');
		}
	}
	// Check if the next index is a closing parenthese
	else if(next === ')'){
		// Then check if current has a comma, which it shouldn't
		if(current.indexOf(',') !== -1){
			tableError('You have a comma on the last data slot. Remember the last one shouldn\'t have a comma.');
		}
	}
	
}

function checkTableData(keywords){
	
	var countSpaces = [], count = 0, lastIndex;
	
	// Check for extra line breaks / empty strings
	// and create an array that contains the index
	// values of where the extra line breaks / empty
	// strings are
	for(i=0;i<keywords.length;i++){
		if(keywords[i] === ''){
			countSpaces.push(i);
		}
	}
	
	// Iterate through the array that contains
	// the index of extra line breaks / empty strings
	// and take them out of the user's code
	for(i=0;i<countSpaces.length;i++){
		keywords.splice(countSpaces[i]-count, 1);
		count++;
	}
	
	// Check if the user put a opening parenthese on the
	// table name. If so...
	if(keywords[2].indexOf('(') !== -1 && keywords[2].indexOf('(') < keywords[2].length-1){
		
		// Remove everything after the opening parenthese from 
		// keywords[2] (table name) and create a new index after
		// it with the value from above 
		var temp = keywords[2].substring(keywords[2].indexOf('(') + 1);
		keywords[2] = keywords[2].replace(temp, '');
		keywords.splice(3, 0, temp);
	}
	
	// Check if the opening parenthese was on the first column_name 
	// instead of by itself or on the table name. If so...
	if(keywords[2].indexOf('(') === -1 && keywords[3].indexOf('(') !== -1 && keywords[3].length > 1){
		
		// Remove it from the column_name and add it to the 
		// table name
		keywords[3] = keywords[3].replace('(', '');
		keywords[2] += '(';
	}
	
	count = 0;
	
	lastIndex = keywords[keywords.length-1];
	
	// Look through the last index to see if it contains two
	// closing parentheses
	for(i=0;i<lastIndex.length;i++){
		if(lastIndex[i] === ')'){
			count++;
		}
	}
	
	// Check if there are two closing parentheses in the 
	// case of varchar OR if the closing parenthese is on 
	// the last data_type and if it is of type int
	if(count === 2 || (lastIndex.indexOf('INT') !== -1 || lastIndex.indexOf('Int') !== -1 || lastIndex.indexOf('int') !== -1) && lastIndex.indexOf(')') !== -1){
		
		// Remove the closing parenthese from the last index
		// of keywords, then create a new index at the end with
		// a closing parenthese
		keywords[keywords.length-1] = lastIndex.replace(')', '');
		keywords.push(')');
	}
	
	return keywords;
}

// Function: Creates a table based on the split up string of code passed in. 
function createTable(code){
	
	// Clears everything on the output area everytime function is run to avoid
	// duplicate tables
	$('#table_area').text('');
	$('#table_information ul').text('');
	
	var table_name, temp;
	
	// Check if open parenthese exist and if it's the last character. If not...
	if(code[2].indexOf('(') !== -1 && code[2].indexOf('(') < code[2].length-1){
		// Get everything past the open parenthese
		temp = code[2].substring(code[2].indexOf('('));
		// and take it out of the original and create
		// the table name
		table_name = code[2].replace(temp, '') + '_table';
	}
	// Otherwise replace the open parenthese if necessary and
	// create the table name
	else{
		table_name = code[2].replace('(', '') + '_table';			
	}
	
	var column_count = 0, data_index;
	var data_type, varchar_amt, error_message;
	
	// Places the new name as the title for the html table
	$('#table_area').append('<p>' + table_name.replace('_table', '') + '</p>');
	
	// Creates an id for the table specific to it's name
	$('#table_area').append('<table id="' + table_name + '"><tr></tr></table>');
	
	
	/*console.log('Create Table called for:' + table_name + code);
	
	for(var i in code){
		console.log(code[i]);
	}*/
	
	// Previous for loop
	
	/*for(i=3;i<code.length;i+=2){
		if(code[i] === ')'){
			$('#' + table_name).children().append('<tr></tr>');
			
			for(j=0;j<column_count;j++){
				$('#' + table_name + ' tbody tr:nth-child(2)').append('<td>' + ' ' + '</td>');
			}
			break;
		}
		$('#' + table_name + ' tbody').children().append('<th>' + code[i] + '</th>');
		column_count++;
	}*/
	
	/*****
	 For loop that iterates through the length of the split up string of code
	 passed in to do four things:
	 1) Create a row in the table to put in table cells after the table headers.
	 2) Create the table headers based on the split up string of code passed in.
	 3) Instead of the correct table header, if there is a syntax error place an
	    error instead.
	 4) Put the correct table header data in the html table.
	*****/
	for(i=2;i<code.length;i++){
		
		// Looks for the open parenthese that:
		// A) Comes before the first column declaration
		// B) that comes with each varchar
		
		// Also, check for int as a data declaration.  If found...
		if(code[i].indexOf('(') !== -1 || code[i].indexOf('INT') !== -1 || code[i].indexOf('Int') !== -1 || code[i].indexOf('int') !== -1){
			// Check if the next index in the split up string of code is the end parenthese
			// If so...
			if(code[i+1] === ')'){
				
				// Create a new table row in the html table...
				$('#' + table_name).children().append('<tr></tr>');
				
				// That will create an amount equal to the amount of table headers of empty
				// table cells, then break out of the other loop.
				for(j=0;j<column_count;j++){
					$('#' + table_name + ' tbody tr:nth-child(2)').append('<td>' + ' ' + '</td>');
				}
				break;
			}
			
			// First checks for errors. Like if there is an extra space, comma out of place
			// and break out of loop.
			// If so...
			if(code[i+1] === ' ' || code[i+1] === ','){
				
				// create the error message in place of the table data. Otherwise...
				$('#' + table_name + ' tbody').children().append('<th>' + 'error' + '</th>');
				error_message = 'You have an error in column declaration #' + column_count + '. Extra space or your comma is out of place.';
				tableError(error_message);
				break;
			}
			else{
				// if the following index is of type varchar...
				if(code[i+2].indexOf('VARCHAR') !== -1 || code[i+2].indexOf('Varchar') !== -1 || code[i+2].indexOf('varchar') !== -1){
					
					// Check for comma errors
					tableCommaCheck(code[i+2], code[i+3], column_count);
					
					// Get the index of the opening / closing parenthese...
					varchar_amt = code[i+2].indexOf('(');
					varchar_amt_two = code[i+2].indexOf(')');
					
					// set data type equal to what's inbetween them
					data_type = code[i+2].slice(0, varchar_amt); 
					
					// and also get the max amount of characters
					max_amount = code[i+2].slice(varchar_amt+1, varchar_amt_two);
					$('#table_information ul').append('<li>' + code[i+1] + ' is of type ' + data_type + ' and can hold ' + max_amount + ' characters.</li>');	
				}
				// Otherwise if the following index is of type int...
				else if(code[i+2].indexOf('INT') !== -1 || code[i+2].indexOf('Int') !== -1 || code[i+2].indexOf('int') !== -1){
					// Check for comma errors
					tableCommaCheck(code[i+2], code[i+3], column_count);
					
					// code[i+1] is the column_name and code[i+2] is the data_type
					
					$('#table_information ul').append('<li>' + code[i+1] + ' is of type ' + code[i+2].replace(',', '') + ' and can hold integers.</li>');	
				}
				// Otherwise there is an error
				else{
					tableError('You have an error in your data declarations. Remember, write the name with no spaces (\' \') in the format: column_name data_type. Refer to the example for help.');
					break;
				}
				$('#' + table_name + ' tbody').children().append('<th>' + code[i+1] + '</th>');
				
			}
			// Add one to the column_count regardless of error or correct data.
			column_count++;
		}
	}
	
	// If an error was triggered, when user fixes all errors re-display information
	// for the table
	if($('#table_area').is(':visible'))
		$('#table_information').show();
	
}

/*
*************
|END| Create Table Functions
*************
*/

/*
*************
|START| Insert Into Functions
*************
*/

function checkInsertData(keywords){
	
	var countSpaces = [], count = 0;
	
	// Check for extra line breaks / empty strings
	// and create an array that contains the index
	// values of where the extra line breaks / empty
	// strings are
	for(i=0;i<keywords.length;i++){
		if(keywords[i] === ''){
			countSpaces.push(i);
		}
	}
	
	// Iterate through the array that contains
	// the index of extra line breaks / empty strings
	// and take them out of the user's code
	for(i=0;i<countSpaces.length;i++){
		keywords.splice(countSpaces[i]-count, 1);
		count++;
	}
	
	console.log(keywords);
	
	return keywords;
}

function insertData(code){
		
	$('#table_errors ul').text('');
	
	//console.log(code);
}

/*
*************
|END| Insert Into Functions
*************
*/

/*
******************************************************************************
|START| Select Functions
******************************************************************************
*/

function checkSelectData(keywords){

	console.log('Start check select data: ', keywords);

	var countSpaces = [], count = 0, temp_val;
	
	// Check for extra line breaks / empty strings
	// and create an array that contains the index
	// values of where the extra line breaks / empty
	// strings are
	outer_loop:
	for(i=0;i<keywords.length;i++){
		
		if(keywords[i] === ''){
			countSpaces.push(i);
		}

		if(keywords[i] === 'WHERE' || keywords[i] === 'Where' || keywords[i] === 'where' || keywords[i] === 'AND' || keywords[i] === 'And' || keywords[i] === 'and'){
			
			for(j=i;j<keywords.length;j++){
				
				// If column_name and operator are together
				if(keywords[j][keywords[j].length-1] === '=' && keywords[j].length !== 1){
					
					keywords[j] = keywords[j].replace('=', '');
					keywords.splice(j+1, 0, '='); 
					
					break;
				}
				
				// If operator and where value are together
				else if(keywords[j][0] === '=' && keywords[j].length !== 1){
					
					keywords[j] = keywords[j].replace('=', '');
					keywords.splice(j, 0, '=');

					break;
				}
				
				// If column_name, operator and value are all together
				else if(keywords[j].indexOf('=') !== -1 && keywords[j].length !== 1){
					
					temp_val = keywords[j].substring(keywords[j].indexOf('=')+1);
					
					keywords[j] = keywords[j].replace(temp_val, '');
					
					keywords.splice(j+1, 0, temp_val);
					
					keywords[j] = keywords[j].replace('=', '');
					keywords.splice(j+1, 0, '='); 
					
					break;
				}
			}
			//break;
		}
	}
	
	// Iterate through the array that contains
	// the index of extra line breaks / empty strings
	// and take them out of the user's code
	for(i=0;i<countSpaces.length;i++){
		keywords.splice(countSpaces[i]-count, 1);
		count++;
	}
	
	
	
	console.log('End check select data: ', keywords);
	
	return keywords;
}

function selectData(code){
	
	// Clear the output area 
	$('#output_table').text('');
	$('#table_errors ul').text('');
	$('#output_table').show();
	
	var header_names = [], choices = [], data_cells = [];
	var where = false, where_column_name, where_value, where_index;
	var and = false, and_column_name = [], and_value = [], and_index;
	var header_amount = 0, count = 0, index = [];
	
	// Loop through the user code and store in the values
	// that the user wants to select i.e. firstname, lastname etc.
	// Also, check if the WHERE clause is being used and if so,
	// set the variable 'where' equal to true, get the column_name for where,
	// the value for where, and the index for the value of where 
	for(i=1;i<code.length;i++){
		
		if(code[i] === 'FROM' || code[i] === 'From' || code[i] === 'from'){
			
			table_name = code[i+1];

			if(code[i+2] === 'WHERE' || code[i+2] === 'Where' || code[i+2] === 'where'){
				
				where = true;
				where_column_name = code[i+3];
				where_value = code[i+5];
				
				if(where_value[0] === '\''){
					if(where_value[where_value.length-1] === '\''){
						where_value = where_value.replace(/'/g, '');
					}
				}
				else if(where_value.search(/[A-Za-z]/) !== -1){
					console.log('Problem');
					return;
				}
			}
			
			break;
		
		}
		
		choices.push(code[i]);
	
	}
	
	for(i=0;i<code.length;i++){
		
		if(code[i] === 'AND' || code[i] === 'And' || code[i] === 'and'){
			
			and = true;
			and_column_name[count] = code[i+1];
			and_value[count] = code[i+3];			
			count++;
		
		}	
	
	}

	console.log(and_column_name, and_value);
	

	
	// Store all of the column names in an array and 
	// get the amount of headers to determine the width
	$('#' + table_name + '_table tr:nth-child(1) th').each(function (){
		
		header_names.push(this.innerHTML);
		if(code[1] === '*'){
			choices.push(this.innerHTML);
		}
		header_amount++;
		
	});
	
	// Get the index of the header_column name for the where column_name
	for(i=0;i<header_names.length;i++){
		if(header_names[i] === where_column_name){
			where_index = i;
		}
	}
	
	// Add in all data cells into the array
	// data_cells
	$('#' + table_name + '_table tr td').each(function (){
		
		data_cells.push(this.innerHTML);
		
	});
	
	// If select all is chosen
	if(code[1] === '*' && code.length === 4){
		
		$('#output_table').append($('#' + table_name + '_table').html());
		
		return;
	}
	
	var start, i, j, k, row_start, subtract_amount, multiplier;
	count = 1;
/*
	// If user wants to select a single row using the WHERE clause...
	if(code[1] === '*'){
		
		// Create a new row
		$('#output_table').append('<tr></tr>');
		
		// Loop through the names of the headers and create
		// table headers for the one row
		for(i=0;i<header_names.length;i++){
			$('#output_table tr:nth-child(1)').append('<th>' + header_names[i] + '</th>');
		}
		
		// Then create a row for the following data
		$('#output_table').append('<tr></tr>');
		
		// Loop through all of the table's data cells
		for(i=0;i<data_cells.length;i++){
			
			// If there is match for the value
			if(data_cells[i] === where_value){
				
				// Go back to the beginning of the current row
				subtract_amount = Math.abs(header_amount - i);
				multiplier = Math.floor(i/header_amount);
				row_start = Math.abs(subtract_amount - i) * multiplier;
				
				// Loop through the current row the amount of cells in
				// the rows
				for(j=row_start;j<header_amount + row_start;j++){
					// To add in each data cell to the output table
					$('#output_table tr:nth-child(2)').append('<td>' + data_cells[j] + '</td>');
				}
			}
		}
		return;
	}*/
	
	var count = 0;
	
	// Create the header row	
	$('#output_table').append('<tr></tr>');
	
	// If the user wants to select specific choices
	for(i=0;i<choices.length;i++){
		
		// Loop through the names of the columns in the table
		for(j=0;j<header_names.length;j++){
			
			// If a match is found...
			if(choices[i] === header_names[j]){
				
				// Set start equal to the index of the matched value
				start = j;
				
				// Create the header row
				$('#output_table tr:nth-child(1)').append('<th>' + header_names[j] + '</th>');
				// When adding data cells to table rows, always start at the 2nd
				// index, which is after the header since nth-child starts at 1
				// instead of 0
				count = 2;
				
				// If user specified the WHERE clause...
				
				if(where){
				
					// Loop through the table data cells array, starting at 
					// the index of the where column_name, and increase it 
					// by the amount of columns in the table each iteration 
					//console.log(where_index, data_cells.length, header_amount);
					for(k=where_index;k<data_cells.length;k+=header_amount){
						
						// If there is a match in the array for the value
						// of the WHERE clause...
						if(data_cells[k] === where_value){
							
							// Create a table row (to take care of all cases),  
							// put that data cell in the output table and break
							// out of the loop
							$('#output_table').append('<tr></tr>');
							$('#output_table tr:nth-child(' + (count) + ')').append('<td>' + data_cells[k - (where_index - start)] + '</td>');
							// Increase count to match the next table row
							
							console.log('count is: ', count);
							count++;
						}
					}
				}
				// Otherwise...
				else{
					// Loop through all of the data cells 
					for(k=start;k<data_cells.length;k+=header_amount){
						
						// Only on the first iteration add 
						// the table rows
						if(i === 0){
							$('#output_table').append('<tr></tr>');
						}
						
						// and select only the data cells chosen
						$('#output_table tr:nth-child(' + count + ')').append('<td>' + data_cells[k] + '</td>');
						
						// Increase count to match the next table row
						count++;
						
					}
				}
			}
		}
	}
	
	// Remove any extra table rows to 
	// take care of all cases
	$('#output_table tr').each(function(){
		if(this.innerHTML === ''){
			$(this).remove();
		}
	});
	
}

/*
******************************************************************************
|END| Select Functions
******************************************************************************
*/

// Function: Takes in a split up string of code and determines which function to 
// call based on what's passed in
function checkData(code){
	
	var comma_check = code.split(/ |\n/), keywords =  code.split(/ |\n|,/);
	console.log(comma_check);
	
	for(i=0;i<comma_check.length;i++){
		
		if(comma_check[i].indexOf(',,') !== -1 || comma_check[i][0] === ',' || comma_check[i] === ','){
			generalError('You have a comma error. Please look over your code and try again.');
		}
	}
	// If the first keyword is of type Create...
/*	if(keywords[0] === 'CREATE' || keywords[0] === 'Create' || keywords[0] === 'create'){
		
		// Then if the following keyword is of type Table...
		if(keywords[1] === 'TABLE' || keywords[1] === 'Table' || keywords[1] === 'table'){
			// Check the table data and set it up to be parsed			
			keywords = checkTableData(keywords);
			
			// If it doesn't have a closing parentheses...
			if(keywords[keywords.length-1] !== ')'){
				// Display the error
				tableError('You need to have a closing parenthese in your query. Make sure you have one. ');
			}
			// Otherwise...
			else
				// Call the function to create a table
				createTable(keywords);
		}
	}*/
	if(keywords[0] === 'SELECT' || keywords[0] === 'Select' || keywords[0] === 'select'){
		keywords = checkSelectData(keywords);
		selectData(keywords);
	}
/*	else if(keywords[0] === 'INSERT' || keywords[0] === 'Insert' || keywords[0] === 'insert'){
		
		if($('#table_area table').val() === undefined){
			generalError('You need to create a table in order to insert data!');
		}
		
		else if($('#table_area table').val() !== undefined){
			keywords = checkInsertData(keywords);
			insertData(keywords);
		}
		
		else
			generalError('You have an error in your code.');
	}*/
	else{
		generalError('You have an error in your code. Please refer to the example.');
	}
}

// When the page is loaded
$('document').ready(function(){
	
	// Listener for when the submit query button is clicked
	$('#parse_sql_code').click(function(e){
		
		// Prevents the page from reloading
		e.preventDefault();
		
		// Splits the line of code up by line breaks and single spaces
		var code = $('#sql_code').val();//.split(/ |\n|,/);
		
		// Pass in the split up code to function checkData
		checkData(code);

	});
});