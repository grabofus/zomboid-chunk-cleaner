import fs from 'fs';

for(let i = 1; i <= 210; i++) {
    const index = i - 1;
    console.log(index % 15, Math.floor(index / 15));
    fs.renameSync(`./src/assets/out${i}.png`, `./src/assets/map_${index % 15}_${ Math.floor(index / 15)}.png`);
}