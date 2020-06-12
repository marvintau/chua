| 语句覆盖率 | 分支覆盖率 | 函数覆盖率 | 代码行覆盖率 |
| -----------|----------|-----------|-------|
| ![Statements](https://img.shields.io/badge/Coverage-77.49%25-red.svg) | ![Branches](https://img.shields.io/badge/Coverage-67.62%25-red.svg) | ![Functions](https://img.shields.io/badge/Coverage-73.57%25-red.svg) | ![Lines](https://img.shields.io/badge/Coverage-77.85%25-red.svg) |

Chuā - 欻
=========

## 简介

「欻」是一个对JavaScript内建的数据结构（Array和Plain Object）进行操作的一套函数集合。在大部分场合下我们的数据比较简单，没有很复杂的结构和行为，就像JSON表示的那样。我们不需要建立一个像LokiJS那样的内存数据库，也不需要像immutable.js那样用HAMT实现的persistent数据结构。我们只需要使用JavaScript自带的`Object``表示记录，以及`Array`来表示列表就可以了。

## 安装
```
$ npm i --save @marvintau/chua
```

## 记录 (Record)

在Python中有Dict类型，在JS中对应的类型是万能的Object。然而JS中Object有太多广泛的含义，它可以是一个存放数据的字典，也可以是一个Prototype，也可以是用一个Prototype创建出来的类（prototype和类的概念还有很大区别），也可以是用一个类创建出的对象，所以我们需要加以区分。我们只想利用Plain Object来存放数据。

所谓的"Plain Object"是指通过[Object Literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#Object_literals)或[Object.create({})](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create)创建的Object实例。

所谓的「记录」可以是任意Plain Object，但是以下方法会向它添加一些属性。

* __children: 是一个Array，其中将会保存作为当前`Record`孩子的其它`Record`。树形结构就是靠它实现的。__children只有在执行向`Record`添加孩子的时候才会创建。
* __path: 是一个Array，保存从最外层Array通向当前`Record`所经过的所有`Record`的children的索引。我们可能需要单独引用`Record`时可能会涉及到对它所在的原始数据结构进行操作。这时就可以通过`__path`来找到对应的`Record`，具体的方法会在下面的API中介绍。

### 设计数据结构的思路

**Q: 为什么不继承Object创建一个新的Record类？**

因为在JS中继承的概念比较费解。从面向对象的角度来看JS中所有的类都继承自Object，更具体地来说，就是扩展了Object.prototype。然而作为prototype的对象本身就是一个Object，这导致了对Object类的继承无论如何都会修改Object本身的定义，这也是一般的面向对象思路在Object这里都会变得很奇怪。因此你会发现很多针对Object的方法都是静态方法，例如`entries`。所以为了避免麻烦，我们既不定义一个Record类来扩展Object，也不创建一个Record类并将Object作为其中一个属性，而是提供了一系列操作Object的函数，来实现我们想要的功能。

**Q: 为什么`__children`和`__path`都是enumerable的？将它们定义为non-enumerable并使得它们不出现在`for .. in`循环中难道不更好吗？**

这样是会好一些，因为在逻辑上`__children`和`__path`并不应该作为「记录」的一部分。然而将它们设置为non-enumerable会带来一些问题，最主要的问题是序列化。大部分前后端通信的库都封装了JSON的stringify/parse的方法，使得发送方可以直接传入对象，而接收方得到的则是经过parse的对象。然而问题是non-enumerable的属性不会被序列化，因此默认情况下接收方会丢失`__children`和`__path`的信息，除非我们在发送之前将它们重新定义为enumerable。显然这带来了更多的麻烦和需要考量的因素。


### `get`

**用法:**
```
get(array, {path, indexColumn, withList})
```
**其中**
* `array`:    包含所有数据的数组
* `path`:     从根结点（array）到所要寻找的数据的路径。
  * 当path是一个array of integer时，将通过每一级`record.__children`的index来寻找。
  * 当path是一个array of string时，则通过每一级`record.__children`中，某一字段匹配path中的值来寻找。此时需要给定indexColumn，也就是字段名，否则会报错。
* `indexColumn`:   当path是array of string时所提供的作为索引的字段名。
* `withList`: 如果`withList`的值为`true`，则返回值中将包含`list`，详见返回值的说明

**返回:**
```
{record, sublings, list}
```
**其中**
* `record`:   要找的那个`Record`
* `sublings`: 要找的`Record`所在的__children
* `list`: 如果`withList`参数值为`true`，那么`list`中将包含从`array`到`record`之间所有经过的record

在实现类似「自动完成」或者「提示」一类的功能时，你可能需要知道你要找的`Record`的其它同辈记录，sublings就是为了完成这个目的添加进来的。

### `add`

```
add(array, recs, {path, column, adIndex})
```
**其中:**
* `recs`:     待插入的`Record`，或者包含`Record`的`Array`
* `array`:    包含所有数据的数组
* `path`:     从根结点（array）到所要寻找的数据的路径。
  * 当path是一个array of integer时，将通过每一级record.__children的index来寻找。
  * 当path是一个array of string时，则通过每一级record.__children中，某一字段匹配path中的值来寻找。此时需要给定column，也就是字段名，否则会报错。
* `column`:   当path是array of string时所提供的字段名。
* `atIndex`: 添加记录的位置。如果atIndex是一个整数，则按照`Array.splice`的第一个参数向`array`或记录的`__children`添加记录，否则按`Array.push`向后添加。

**返回:** 无

`add`和`get`的参数很类似，因为`add`本身就用到了`get`。如果`path`指向了一个`Record`，那么会向这个`Record`的`__children`添加。如果`path`为空，或者没有第三个options的选项，那么会直接添加到array中。

**示例:**
```
const array = [{num: 0, name: 'asd'}, {num: 1, name:'dsda'}];
add(array, {num:2, name:'bsd'});
console.log(array);

const array = [{num: 0, name: 'asd'}, {num: 1, name:'dsda'}];
add(array, {num:2, name:'bsd'}, {path=[0]});
console.log(array);
```

## `set`
```
set(array, kvs, {path, column, adIndex})
```

**其中:**
* `array`:  包含被操作数据的数组
* `kvs`:    包含


## `del`
## `sort`
## `flat`
## `group`
