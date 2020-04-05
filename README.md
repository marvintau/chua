| Statements | Branches | Functions | Lines |
| -----------|----------|-----------|-------|
| ![Statements](https://img.shields.io/badge/Coverage-97.45%25-brightgreen.svg "Make me better!") | ![Branches](https://img.shields.io/badge/Coverage-87.13%25-yellow.svg "Make me better!") | ![Functions](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg "Make me better!") | ![Lines](https://img.shields.io/badge/Coverage-98.65%25-brightgreen.svg "Make me better!") |

Chuā - 欻
=========

## Intro

「欻」是一个对JavaScript内建的数据结构（Array和Plain Object）进行操作的一套函数集合。在大部分场合下我们的数据比较简单，没有很复杂的结构和行为，就像JSON表示的那样。我们不需要建立一个像LokiJS那样的内存数据库，也不需要像immutable.js那样用HAMT实现的persistent数据结构。

"Chua" is a set of functions that operate Array and Plain Object, the built-in data structore of JavaScript. In the most common scenarios, we just want our data be a native version of JSON, with some convenient data handling method possibly. There's no need to use an in-memory database like LokiJS, or employing a persistent data structure implemented with HAMT, such as immutable.js.

## `Record`
在Python中有Dict类型，在JS中对应的类型是万能的Object。然而Object有太多广泛的含义，它可以是一个存放数据的字典，也可以是一个Prototype，也可以是用一个Prototype创建出来的类（prototype和类的概念还有很大区别），也可以是用一个类创建出的对象，所以我们需要加以区分。我们只想利用Plain Object来存放数据。

`Record`可以是任意Plain Object，但是以下方法会向它添加一些属性。这些属性是non-enumerable的，所以不会出现在for-in循环中。这些属性包括：

* __children: 是一个Array，其中将会保存作为当前`Record`孩子的其它`Record`。树形结构就是靠它实现的。__children只有在执行向`Record`添加孩子的时候才会创建。
* __path: 是一个Array，保存从最外层Array通向当前`Record`所经过的所有`Record`的children的索引。有时我们会创建一些新的数据结构（譬如将树形结构的Array进行flatten操作），但是希望能通过新的数据结构对

## get

```
get(array, {path, column, withList})
```
**其中：**
* `array`:    包含所有数据的数组
* `path`:     从根结点（array）到所要寻找的数据的路径。
  * 当path是一个array of integer时，将通过每一级record.__children的index来寻找。
  * 当path是一个array of string时，则通过每一级record.__children中，某一字段匹配path中的值来寻找。此时需要给定column，也就是字段名，否则会报错。
* `column`:   当path是array of string时所提供的字段名。
* `withList`: 如果`withList`的值为`true`，则返回值中将包含`list`，详见返回值的说明

**Returns:**
```
{record, sublings, list}
```
**其中：**
* `record`:   要找的那个`Record`
* `sublings`: 要找的`Record`所在的__children
* `list`: 如果`withList`参数值为`true`，那么`list`中将包含从`array`到`record`之间所有经过的record

## add

```
add(array, recs, {path, column, withList})
```
**其中：**
* `recs`:     待插入的`Record`，或者包含`Record`的Array
* `array`:    包含所有数据的数组
* `path`:     从根结点（array）到所要寻找的数据的路径。
  * 当path是一个array of integer时，将通过每一级record.__children的index来寻找。
  * 当path是一个array of string时，则通过每一级record.__children中，某一字段匹配path中的值来寻找。此时需要给定column，也就是字段名，否则会报错。
* `column`:   当path是array of string时所提供的字段名。
* `withList`: 如果`withList`的值为`true`，则返回值中将包含`list`，详见返回值的说明

**Returns:**
```
{record, sublings, list}
```
**其中：**
* `record`:   要找的那个`Record`
* `sublings`: 要找的`Record`所在的__children
* `list`: 如果`withList`参数值为`true`，那么`list`中将包含从`array`到`record`之间所有经过的record