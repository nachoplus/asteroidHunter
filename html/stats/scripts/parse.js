

function escapeHTML(str)
{
   //code portion borrowed from prototype library
   var div = document.createElement('div');
   var text = document.createTextNode(str);
   div.appendChild(text);
   return div.innerHTML;
   //end portion
}

function wordwrap(str)
{
   parts = str.split(" ");

   for(i = 0; i < parts.length; i++)
   {
      if(parts[i].length <= 30) continue;

      t = parts[i].length;
      p = "";

      for(var j = 0; j < (parts[i].length - 30); j += 30) p += parts[i].substring(j, j + 30) + "<wbr />";
      parts[i] = p + parts[i].substring(j, parts[i].length);
   }

   return parts.join(" ");
}

var elementCount = 0;
var arrayCount = 0;
var objectCount = 0;
var nestingLevel = 0;

function doStats()
{
   var out = "<input type='button' id='statst' onclick='showStats();' value='Show Statistics' style='float: right;' />\n"
    + "<div class='clear'></div>\n"
     + "<div id='statscon'>\n<table>\n<tr>\n<td>Number of Arrays:</td>\n<td>" + arrayCount + "</td>\n</tr>\n"
      + "<tr>\n<td>Number of Objects:</td>\n<td>" + objectCount + "</td>\n</tr>\n"
       + "<tr>\n<td>Total number of all elements:</td>\n<td>" + elementCount + "</td>\n</tr>\n"
        + "<tr>\n<td>Nesting depth:</td>\n<td>" + nestingLevel + "</td>\n</tr>\n"
         + "</table>\n</div>\n</div>\n";
   return out;
}

function parseValue(val, parent, level)
{
   elementCount++;
   if(parent == null) parent = "";
   if(level == null) level = 1;

   if(typeof(val) == "object")
   {
      if(level > nestingLevel) nestingLevel = level;
      if(val instanceof Array)
      {
         arrayCount++;
         parent = parent + (parent != "" ? " > " : "") + "Array (" + val.length + " item" + (val.length != 1 ? "s)" : ")");

         var out = "<div class='wrap'>\n<div class='array' onmouseover='doFocus(event, this);'>\n<div class='widgets'><img src='images/min.gif' onclick='hideChild(this);' /></div>\n<h3><span class='titled' title='" + parent + "'>Array</span></h3>\n";

         if(val.length > 0)
         {
            out += "<table class='arraytable'>\n<tr><th>Index</th><th>Value</th></tr>\n";
            
            for(prop in val)
            {
               if(typeof(val[prop]) == "function") continue;
               out += "<tr><td>" + prop + "</td><td>" + parseValue(val[prop], parent, level + 1) + "</td></tr>\n";
            }
            
            out += "</table>\n";
         }
         else
         {
            
            return "(empty <span class='titled' title='" + parent + "'>Array</span>)\n";
         }
         
         out += "</div>\n</div>\n";
         return out;
      }
      else
      {
         objectCount++;
         i = 0;
         for(prop in val)
         {
            if(typeof(val[prop]) != "function") i++;
         }

         parent = parent + (parent != "" ? " > " : "") + "Object (" + i + " item" + (i != 1 ? "s)" : ")");

         var out = "<div class='wrap'>\n<div class='object' onmouseover='doFocus(event, this);'>\n<div class='widgets'><img src='images/min.gif' onclick='hideChild(this);' /></div>\n<h3><span class='titled' title='" + parent + "'>Object</span></h3>\n";
         
         if(i > 0)
         {
            out += "<table class='objecttable'>\n<tr><th>Name</th><th>Value</th></tr>\n";
            for(prop in val)
            {
               if(typeof(val[prop]) == "function") continue;
               out += "<tr><td>" + prop + "</td><td>" + parseValue(val[prop], parent, level + 1) + "</td></tr>\n";
            }
            
            out += "</table><div class='clear'></div>\n";
         }
         else
         {
            return "(empty <span class='titled' title='" + parent + "'>Object</span>)\n";
         }
         
         out += "</div>\n</div>\n";
         return out;
      }
   }
   else
   {
      if(typeof(val) == "string") return "<span class='string'>" + wordwrap(val.replace(/\n/g, "<br />")) + "</span>";
      else if(typeof(val) == "number") return "<span class='number'>" + val + "</span>";
      else if(typeof(val) == "boolean") return "<span class='boolean'>" + val + "</span>";
      else return "<span class='void'>(null)</span>";
   }
}

function parse(str)
{
   elementCount = 0;
   arrayCount = 0;
   objectCount = 0;

   var obj = null;
   try
   {
      obj = $.parseJSON(str);
   }
   catch(e)
   {
      if(e instanceof SyntaxError)
      {
         alert("There was a syntax error in your JSON string.\n" + e.message + "\nPlease check your syntax and try again.");
         return;
      }

      alert("There was an unknown error. Perhaps the JSON string contained a deep level of nesting.");
      return
   }

   return parseValue(obj, null, null);
}

function doParse(){
   setTimeout(doParse2, 50);
}

function doParse2()
{
   var value = $("#text").val();
   
   if(value.substr(0, 4) == "http" || value.substr(0, 4) == "file" || value.substr(0, 3) == "ftp")
   {
      getURL(value);
   }
   else
   {
      var result = parse(escapeHTML(value), null);
      $(".output").html("");
      $(".output").append(result);
   }
}






function hideChild(ele)
{
   var src = ele.src + "";
   var minimizing = (src.indexOf("min.gif") != -1);

   var nodes = ele.parentNode.parentNode.childNodes;
   for(i = 0; i < nodes.length; i++)
   {
      if(nodes[i].tagName == "TABLE")
      {
         nodes[i].style.display = (minimizing ? "none" : "");

         ele.parentNode.parentNode.style.paddingRight = (minimizing ? "2.0em" : "1.5em");
         ele.parentNode.style.right = (minimizing ? "1em" : "1.5em");

         ele.src = (minimizing ? "images/max.gif" : "images/min.gif");

         return;
      }
   }
}

var currentlyFocused = null;
function doFocus(event, ele)
{
   if(currentlyFocused != null) currentlyFocused.style.border = "1px solid #000000";
   ele.style.border = "1px solid #ffa000";

   currentlyFocused = ele;

   if(!event) event = window.event;
   event.cancelBubble = true;
   if(event.stopPropagation) event.stopPropagation();
}

function stopFocus()
{
   if(currentlyFocused != null) currentlyFocused.style.border = "1px solid #000000";
}

//code from Painfully Obvious.
//based on code from quirksmode.org
var Client = {
  viewportWidth: function() {
   return self.innerWidth || (document.documentElement.clientWidth || document.body.clientWidth);
  },

  viewportHeight: function() {
    return self.innerHeight || (document.documentElement.clientHeight || document.body.clientHeight);
  },
  
  viewportSize: function() {
    return { width: this.viewportWidth(), height: this.viewportHeight() };
  }
};





