# Game Flow Diagram

## Scene Flow

```
┌─────────────┐
│  BootScene  │  Initialize game systems
└──────┬──────┘
       │
       v
┌─────────────┐
│PreloadScene │  Load all assets + show progress bar
└──────┬──────┘  Create animations
       │
       ├──────────────┐
       v              v
┌─────────────┐  ┌─────────────┐
│RunnerScene  │  │  UIScene    │  Both scenes run in parallel
│(Main Game)  │  │    (HUD)    │
└─────────────┘  └─────────────┘
```

## Game Loop (RunnerScene)

```
┌─────────────────────────────────────────┐
│              Game Update                │
├─────────────────────────────────────────┤
│                                         │
│  1. Update Player                       │
│     • Check keyboard input (W/S)        │
│     • Handle jump (variable height)     │
│     • Handle slide (hitbox change)      │
│     • Update animations                 │
│     • Increase speed over time          │
│                                         │
│  2. Update Spawner                      │
│     • Spawn timer countdown             │
│     • Spawn obstacles/collectibles      │
│     • Decrease spawn interval           │
│                                         │
│  3. Move World Objects                  │
│     • Scroll obstacles left             │
│     • Scroll collectibles left          │
│     • Scroll backgrounds (parallax)     │
│     • Scroll ground                     │
│                                         │
│  4. Check Collisions                    │
│     • Player vs Ground                  │
│     • Player vs Obstacles               │
│     • Player vs Collectibles            │
│                                         │
│  5. Update Camera                       │
│     • Follow player                     │
│                                         │
│  6. Emit Game State to UI               │
│     • Score, distance, time             │
│     • Data quality                      │
│     • Collected items                   │
│                                         │
└─────────────────────────────────────────┘
```

## Collision Handlers

### Obstacle Collision
```
Player hits Obstacle
       │
       v
┌──────────────────┐
│ Reduce Data      │
│ Quality by       │
│ damage amount    │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│ Break Combo      │
│ (reset to 0)     │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│ Flash Player Red │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│ Remove Obstacle  │
└────────┬─────────┘
         │
         v
    Data Quality
       <= 0?
         │
    ┌────┴────┐
    │ Yes     │ No
    v         v
 Game Over   Continue
```

### Collectible Collision (Flora)
```
Player collects Flora (Correct)
       │
       v
┌──────────────────┐
│ Increase Combo   │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│ Add Score +      │
│ Combo Bonus      │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│ Add to Inventory │
│ Strip            │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│ Play Collection  │
│ Animation        │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│ Remove           │
│ Collectible      │
└──────────────────┘
```

### Collectible Collision (Fauna)
```
Player collects Fauna (Wrong)
       │
       v
┌──────────────────┐
│ Reduce Data      │
│ Quality (-10%)   │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│ Break Combo      │
│ (reset to 0)     │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│ Flash Player Red │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│ Add to Inventory │
│ Strip (marked X) │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│ Play Collection  │
│ Animation        │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│ Remove           │
│ Collectible      │
└──────────────────┘
```

## Spawner Logic

```
Spawn Timer Ready?
       │
       v
┌──────────────────┐
│ Random Choice    │
│ 60% Collectible  │
│ 40% Obstacle     │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    v         v
Obstacle   Collectible
    │         │
    v         v
┌────────┐ ┌────────┐
│ 70%    │ │ 70%    │
│ Yellow │ │ Flora  │
│        │ │(Good)  │
│ 30%    │ │ 30%    │
│ Orange │ │ Fauna  │
│        │ │(Bad)   │
└────┬───┘ └───┬────┘
     │         │
     v         v
 Get from   Get from
  Object     Object
   Pool       Pool
     │         │
     v         v
┌─────────────────┐
│ Spawn at        │
│ Random Zone:    │
│ • Ground        │
│ • Mid           │
│ • Upper         │
└─────────────────┘
```

## Player State Machine

```
                    ┌──────────┐
                    │   Idle   │
                    └────┬─────┘
                         │
                         v
              ┌──────────────────┐
              │     Running      │◄────┐
              └──┬────────────┬──┘     │
                 │            │        │
        Press W  │            │ Press S│
                 │            │        │
                 v            v        │
          ┌──────────┐   ┌──────────┐ │
          │ Jumping  │   │ Sliding  │ │
          │          │   │          │ │
          │ Hold W:  │   │ Timer:   │ │
          │ Variable │   │ 500ms    │ │
          │ Height   │   └─────┬────┘ │
          └────┬─────┘         │      │
               │               └──────┘
          velocity.y > 50
               │
               v
          ┌──────────┐
          │ Falling  │
          └────┬─────┘
               │
          Touching Ground
               │
               v
          Back to Running
```

## HUD Update Flow

```
RunnerScene emits 'updateGameState'
       │
       v
┌──────────────────────────────────┐
│         UIScene receives         │
├──────────────────────────────────┤
│                                  │
│  Update Score Text               │
│  Update Data Quality Bar         │
│  Update Distance Text            │
│  Update Time Text                │
│  Update Combo Text (if > 1)      │
│  Update Inventory Strip          │
│                                  │
└──────────────────────────────────┘
```

## Game Over Flow

```
Data Quality <= 0
       │
       v
┌──────────────────┐
│ Pause Physics    │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│ Emit 'gameOver'  │
│ event with stats │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│ UIScene shows    │
│ Game Over screen │
│ • Final Score    │
│ • Distance       │
│ • Time           │
│ • Restart Button │
└────────┬─────────┘
         │
    Player clicks
      Restart
         │
         v
┌──────────────────┐
│ scene.restart()  │
│ (RunnerScene)    │
└──────────────────┘
```

## Difficulty Scaling

```
Time elapsed increases
       │
       ├─────────────────┐
       │                 │
       v                 v
┌──────────────┐   ┌──────────────┐
│ Increase     │   │ Decrease     │
│ Player Speed │   │ Spawn        │
│              │   │ Interval     │
│ +0.5/second  │   │ -10ms/second │
│ Max: 800     │   │ Min: 800ms   │
└──────────────┘   └──────────────┘
       │                 │
       └────────┬────────┘
                │
                v
        Game gets harder
```

## Object Pooling Pattern

```
┌─────────────────────────────────────┐
│         Object Pool                 │
├─────────────────────────────────────┤
│                                     │
│  Pre-created objects:               │
│  • 20 Obstacles                     │
│  • 30 Collectibles                  │
│                                     │
│  Active objects: visible + moving   │
│  Inactive: hidden, waiting          │
│                                     │
└─────────────────────────────────────┘
            │
    ┌───────┴───────┐
    │               │
    v               v
Need object    Object off-screen
    │               │
    v               v
Get inactive   Mark inactive
 object        (reset position)
    │               │
    v               v
Spawn at       Return to pool
new position
    │               │
    v               v
Mark active    Ready to reuse
```

## Controls Flow

### Desktop
```
┌──────────┐
│ Press W  │───► Jump()
└──────────┘     │
                 v
            Hold W for 300ms?
                 │
            ┌────┴────┐
            │ Yes     │ No
            v         v
       Higher Jump  Normal Jump


┌──────────┐
│ Press S  │───► StartSlide()
└──────────┘     │
                 v
            Reduce hitbox height 50%
                 │
                 v
            Timer: 500ms
                 │
                 v
            EndSlide()
                 │
                 v
            Restore normal hitbox
```

### Mobile
```
┌──────────────┐
│ Tap Jump Btn │───► player.jump()
└──────────────┘

┌──────────────┐
│ Tap Slide Btn│───► player.startSlide()
└──────────────┘
```
