class Ghost{
    static dirs = [[0,1], [1,0], [0,-1], [-1,0]];
    constructor(r, c, dr, dc, tr, tc, str, stc){
        this.r = r; this.c = c;
        this.dr = dr; this.dc = dc;
        this.tr = tr; this.tc = tc;
        this.str = str; this.stc = stc;
        this.state = 0;
    }

    getMoves(maze){
        const moves = new Map();
        for (const [index, direction] of Ghost.dirs.entries()) {
            const canMove = (maze[this.r+direction[0]][this.c+direction[1]] == 1);
            const dirHash = direction.toString();
            moves.set(dirHash, canMove);    
        }
        return moves;
    }

    randomMove(moves){
      console.log(moves);
        let randIndex = Math.floor(Math.random() * 4 - 0.0001);
        for (let i=0; i<4; i++){
            let j=(index+i)%4;
            if (moves.get(j) && !(Ghost.dirs[j][0] == -this.dr && Ghost.dirs[j][1] == -this.dc)){
                return [[Ghost.dirs[j][0]+this.r, Ghost.dirs[j][1]+this.c], Ghost.dirs[j]];
            }
        }
        return [[this.r,this.c],[0,0]];
    }

    nextPosition(maze){
        const moves = this.getMoves(maze);
        if (this.state == 2){
            return this.randomMove(moves);
        }
        
        const dirHash = [this.dr, this.dc].toString();
        const dHash = [1,0].toString();
        const uHash = [-1,0].toString();
        const rHash = [0,1].toString();
        const lHash = [0,-1].toString();

        const isIntersection = (
            !(moves.get(dirHash)) ||
            this.dr == 0 && (moves.get(dHash) || moves.get(uHash)) || 
            this.dc == 0 && (moves.get(rHash) || moves.get(lHash))
        );

        if (!isIntersection){
            return [[this.dr+this.r, this.dc+this.c], [this.dr, this.dc]];
        }

        else{
            let bestDirection = [0,0];
            let bestDistance = 1e10;

            for (const [index, currDir] of Ghost.dirs.entries()) {
                const currHash = currDir.toString();
                console.log("considering: ", currDir);
                if (!moves.get(currHash) || dirHash === currHash) continue;
                
                console.log("VALID: ", currDir);
                let tr = this.state == 0 ? this.str : this.tr;
                let tc = this.state == 0 ? this.stc : this.tc;
                let currDistance = (currDir[0]+this.r-tr)**2 + (currDir[1]+this.c-tc)**2;
                if (currDistance < bestDistance){
                    bestDistance = currDistance;
                    bestDirection = currDir;
                }
            }

            return [[bestDirection[0]+this.r, bestDirection[1]+this.c], bestDirection];
        }
    }

    forcedReversal(){
        this.dr *= -1;
        this.dc *= -1;
    }
}