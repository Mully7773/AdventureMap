# AdventureMap

![License Badge](https://img.shields.io/github/license/Mully7773/AdventureMap)
![Top Language](https://img.shields.io/github/languages/top/Mully7773/AdventureMap)

## Link:

Check it out here: https://mully7773.github.io/AdventureMap/
<br>

## Demo:

<br>

## Description

This is an interactive map application I developed using HTML, CSS, and JavaScript. The inspiration for this project came from Mapty, another application you can view [here](https://github.com/Mully7773/Mapty).

<br>

## Functionality

Users are presented with a map they can click on. The location on the map where the user clicks should be where their adventure occurred or will occur. Users are then presented with a form. The form has various inputs from which the user may provide details pertaining to their adventure. These details include "type", "activity", "money" (or cost), "date", and "duration". The type field is split into three options: solo, family, and friends. Users can select any date via the date picker in the date field. In addition, the duration field has three separate inputs, which allows the user to input a more specific adventure duration (e.g. 3 6 30 = 3 days, 6 hours, 30 minutes). Form validation currently displays via alerts.

Upon submitting the form, users will see a map marker placed in the location where they clicked the map in addition to a popup that displays an abbreviated snippet of their adventure, i.e., activity icon, name, and date. Users will also notice their adventure displayed on the left-hand transparent sidebar. Visually, these adventure details 'float' above the map. The adventure description is formatted automatically based on the user input. Different icons and text display depending on the type that was selected at the outset. Further adventures can be added to the map as the user sees fit, and if a particular adventure is difficult to locate, the user can click on their adventure in the sidebar and the map will scroll to the location on the map. The adventures are always contained within the map no matter how many are posted. Finally, all adventures are stored in local storage, so users are able to view their adventures even after exiting or refreshing the page.

If a user wishes to delete a single adventure, they may click the "X" icon near the top of their submitted adventure and confirm deletion. Users also have the option to start fresh and remove all of their adventures by clicking on the 'Clear' button that appears after a single adventure is created.

The map itself also includes a few bonus features. Perhaps the first the user will notice is the tile button located at the top right of the map. Users can select between several different map tiles including the default option (Google Maps), OpenStreetMaps, satellite (Google Maps), and topography (Mundialis). Please note that topography is most interesting when the map is zoomed out, which can be accomplished by scrolling on the map or by using the customized zoom-in and zoom-out buttons located near the bottom right portion of the map.
<br>

## Notes

1. Since this map application also utilizes Leaflet, the location provided is not 100% accurate. It may be based on the user's IP address or network. Nevertheless, allowing the application access to your current location will bring the map to somewhere familiar from which the user can easily locate their adventure location.

<br>

## Technology

HTML
<br>
CSS
<br>
JavaScript
<br>
UUID (third-party ID generator)
Leaflet (third-party library) - Leaflet is used to generate the map, map tiles, map layers, and zoom-in/zoom-out buttons
<br>
Local Storage API - Used to store persistent data (user adventures)
<br>
Moment.js - Used to nicely format the date

<br>

## Questions:

Feel free to contact me at mully7773@gmail.com if you have any questions. <br>
You can view more of my projects at https://github.com/Mully7773.
