Ok Ian, you've set out to make a deli slicer application. The goal is to create a "game" of trying to slice cold cuts for a customer. It will mimic real life conditions such as setting a slicer thickness, counting individual slices, fulfilling customer orders, and varying product weights with visual approximations.
---

# HeadlineTemplate

---


---

# Game Flow

---

- Get customer order, a list of product names and target weights.
- Select a product
- Select blade thickness
- Slice (individual slices are not steps Ian!)
- Weigh
- Bag it
- Have a Nice Day!
- Get Score
- Another one?

---

# Game Mechanics

---

Fulfil the customers' order in the least amount of steps. Minimum would be 5 (select product, select thiccness, slicing, weighing, bagging) per item in an order.
So lets say an order had 4 items, 20 minimum steps.

After pressing Weigh button, thickness will be set to 0.

//If a slicedProduct is overweight

!* * *Important* * *!
the game loop must check to see if the current action is the same as the last action. We're not trying to track each slice and thickness calibration. [product, thickness, slice, weigh, ]
!* * *Important* * *!

---

# Game Board Layout/Functionality

---

- Slicer Thickness
  - a slider from 0 to 2. _What are the increments in?_ incremental markers on the side, snap to increments
* Slice

---

# Game Class

---

Steps
- Start
  * generates the order 
  * add step start
- Select
  * sets onSlicer:Product
  * add step select-x
- Blade
  * setBlade(x = 0) that takes a number, sets blade to that number
  * add step blade
- Slice
  * takes a product and a blade, pushes to slices[] if > 0.
  * this is where we "make a new product" to not mutate the order array
  * add step slice
- Weigh
  * just add weigh step, scale is scale
- Bag
  * if not enough, do nothing.
  * if too much, reduce slices[] and push to waste[]
  * add bag step
  * win()