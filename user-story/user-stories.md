User story for how the REST API service may behave.

## User Story 1
As a student, I want to find the geographic location of a room, so that I can go to that room for class.


#### Definitions of Done(s)
Scenario 1: The room can be found.
Given: User on the find location page.
When: The user inputs the short name for a room.  
Then: The application presents the geographic location (latitude and longitude) of the room on the page.

Scenario 2: The room cannot be found.
Given: User on the find location page.
When: The user inputs the short name for a room.
Then: The applications presents an error message on a popup.


## User Story 2
As an instructor, I want to find a room that has the number of seats, furniture type,
and room type necessary for my class, so that I can use that classroom for my class.


#### Definitions of Done(s)
Scenario 1: A suitable room is found.
Given: User on find room page.  
When: The user inputs a combination of seats, furniture type, and room type
and clicks enter.
Then: The application presents the short name of a room that satisfies the requirements.

Scenario 2: No suitable room is found.
Given: User on find room page.  
When: The user inputs a combination of seats, furniture type, and room type
and clicks enter.
Then: The application presents a pop-up telling the user no suitable room was found.

## Others
You may provide any additional user stories + DoDs in this section for general TA feedback.  
Note: These will not be graded.
