---
layout: api
title: <$ doc.codeName $>
permalink: /api/:title.html
---
<$ doc.codeName $>
===

<$ doc.description $>

<@ if doc.params @>
## Params
<@ for param in doc.params @>
*  **<$ param.name $>** { <$ param.typeList $> } - <$ param.description $>
<@ endfor @>
<@ endif @>

<@ if doc.properties @>
## Properties
<@ for property in doc.properties @>
* **<$ property.codeName $>** { <$ property.type.typeList $> } - <$ property.description $>
<@ endfor @>
<@ endif @>

<@ if doc.methods @>
## Methods
<@ for method in doc.methods @>
* **<$ method.codeName $>** - <$ method.description $>
<@ endfor @>
<@ endif @>

<@ if doc.events @>
## Events
<@ for event in doc.events @>
* **<$ event.name $>** - <$ event.description $>
<@ endfor @>
<@ endif @>

<@ if doc.returns @>
## Returns
  { <$ doc.returns.typeList $> } - <$ doc.returns.description $>
<@ endif @>
