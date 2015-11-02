# skill-calendar
[ ![Codeship Status for RyanMarcus/skill-calendar](https://codeship.com/projects/7375b450-634e-0133-6ac1-62dbb5275a9f/status?branch=master)](https://codeship.com/projects/112767)


This is a simple NodeJS script to make "cool" skill calendars like this one:

![a skill calendar](https://raw.githubusercontent.com/RyanMarcus/skill-calendar/master/example.png)

To install, use `NPM`:

    npm install -g skill-calendar

`skill-calendar` takes a basic TSV (tab seperated values) file like this:

    Year	Java	SQL		Python
    2008	none	high	low
    2009 	high	high	low
    2010 	high	high	low

... and turns it into a graphic like the one above.

Usage is pretty simple:

    ~ ➳ skill-calendar 
    usage: skill-calendar [options] file
    	--png output.png: outputs a PNG
    	--svg output.svg: outputs an SVG
    	--no-optimize: don't do SVG optimizations
    If neither option is given, output is written to stdout.
    
So, to generate an SVG from the file `calendar.tsv`:

    skill-calendar calendar.tsv > calendar.svg
    
Or:

    skill-calendar --svg calendar.svg calendar.tsv
    
You can also use the `--png` option to create a PNG:

    skill-calendar --png calendar.png calendar.tsv
    


> skill-calendar is free software: you can redistribute it and/or modify
> it under the terms of the GNU General Public License as published by
> the Free Software Foundation, either version 3 of the License, or
> (at your option) any later version.
>  
> skill-calendar is distributed in the hope that it will be useful,
> but WITHOUT ANY WARRANTY; without even the implied warranty of
> MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	 See the
> GNU General Public License for more details.
>  
> You should have received a copy of the GNU General Public License
> along with skill-calendar.  If not, see <http://www.gnu.org/licenses/>.
