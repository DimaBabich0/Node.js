const fs = require('fs');

class Participant
{
  constructor(name)
  {
    this.name = name;
  }

  run()
  {
    return `${this.name} is running`;
  }

  jump()
  {
    return `${this.name} is jumping`;
  }
}

class Human extends Participant
{
  canRun(distance)
  {
    return distance <= 200;
  }

  canJump(height)
  {
    return height <= 2;
  }
}
class Cat extends Participant
{
  canRun(distance)
  {
    return distance <= 400;
  }

  canJump(height)
  {
    return height <= 3.5;
  }
}
class Robot extends Participant
{
  canRun(distance)
  {
    return distance <= 100;
  }

  canJump(height)
  {
    return height <= 1;
  }
}

class Obstacle
{
  constructor(value)
  {
    this.value = value;
  }

  overcome(participant)
  {
    return participant.canRun(this.value) || participant.canJump(this.value);
  }
}

class RunningTrack extends Obstacle
{
  constructor(value)
  {
    super(value);
    this.type = 'RunningTrack';
  }

  overcome(participant)
  {
    return participant.canRun(this.value);
  }
}
class Wall extends Obstacle
{
  constructor(value)
  {
    super(value);
    this.type = 'Wall';
  }

  overcome(participant)
  {
    return participant.canJump(this.value);
  }
}

function passObstacle(participants, obstacles)
{
  let result = '';

  participants.forEach(participant =>
  {
    let isSucceeded = true;
    let totalDistance = 0;

    for (const obstacle of obstacles)
    {
      if (isSucceeded)
      {
        if (obstacle.type === 'RunningTrack' && obstacle.overcome(participant))
        {
          totalDistance += obstacle.value;
        }
        else if (!obstacle.overcome(participant))
        {
          isSucceeded = false;
          result += `Participant ${participant.name} did not overcome obstacle \"${obstacle.type}\" with difficulty ${obstacle.value}. Total distance: ${totalDistance}\n`;
          break;
        }
      }
    }

    if (isSucceeded)
    {
      result += `${participant.name} passed all the obstacles. Total distance: ${totalDistance}\n`;
    }
  });

  fs.writeFileSync('result.txt', result);
  console.log('Result was saved to file');
}

const participants =
[
  new Human('Dima'),
  new Cat('Kitty'),
  new Robot('Bebop')
];

const obstacles =
[
  new RunningTrack(100),
  new Wall(2),
  new RunningTrack(200),
  new Wall(3),
  new RunningTrack(300),
];

passObstacle(participants, obstacles);