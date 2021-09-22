// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

enum State {
    stand = 0,  // 站立
    attack = 1 // 攻击
}

enum animationState {
    idle = 'idle',
    run = 'run',
    attack = 'attack',
    attack2 = 'attack2',
    attack3 = 'attack3',
}

const input = {}

@ccclass
export default class Hero extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    @property
    _speed: number

    @property
    sp: cc.Vec2

    @property
    heroState: State

    @property
    animationState: animationState

    @property
    heroAnimation: cc.Animation

    @property
    lv: cc.Vec2

    @property
    combo: number
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._speed = 200
        this.sp = cc.v2(0, 0)
        this.combo = 0
        this.heroState = State.stand
        this.animationState = animationState.idle
        this.heroAnimation = this.node.getComponent(cc.Animation)

        this.heroAnimation.on('finished', this.onAnimationFinished, this)

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this)
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this)
    }
    onDestroy () {
        this.heroAnimation.off('finished', this.onAnimationFinished, this)

        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this)
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyUp, this)
    }
    start () {

    }

    setAnimation (animationState: animationState) {
        if (this.animationState === animationState) return

        this.animationState = animationState
        this.heroAnimation.play(animationState)
    }

    onAnimationFinished (type: string, data: cc.AnimationState) {
        if (data.name === animationState.attack || data.name === animationState.attack2 || data.name === animationState.attack3) {
            this.heroState = State.stand
            this.combo = (this.combo + 1) % 3
        }
    }

    update (dt: any) {
        let animation = this.animationState
        this.lv = this.node.getComponent(cc.RigidBody).linearVelocity
        let scaleX = Math.abs(this.node.scaleX)

        switch (this.heroState) {
            case State.stand: {
                if (input[cc.macro.KEY.j]) {
                    this.heroState = State.attack
                }
            }

                break;

            default:
                break;
        }

        if (this.heroState === State.attack) {
            if (input[cc.macro.KEY.j]) {
                if (this.combo === 0) {
                    animation = animationState.attack
                } else if (this.combo === 1) {
                    animation = animationState.attack2
                } else {
                    animation = animationState.attack3
                }
            }
        }

        if (this.heroState !== State.stand) {
            this.sp.x = 0
        } else {
            this.combo = 0
            if (input[cc.macro.KEY.a] || input[cc.macro.KEY.left]) {
                this.sp.x = -1
                this.node.scaleX = -scaleX
                animation = animationState.run
            } else if (input[cc.macro.KEY.d] || input[cc.macro.KEY.right]) {
                this.sp.x = 1
                this.node.scaleX = scaleX
                animation = animationState.run
            } else {
                this.sp.x = 0
                animation = animationState.idle
            }
        }

        if (this.sp.x) {
            this.lv.x = this.sp.x * this._speed
        } else {
            this.lv.x = 0
        }

        if (animation) this.setAnimation(animation)
        this.node.getComponent(cc.RigidBody).linearVelocity = this.lv
    }

    onKeyDown (e: cc.Event.EventKeyboard) {
        input[e.keyCode] = 1
    }
    onKeyUp (e: cc.Event.EventKeyboard) {
        input[e.keyCode] = 0
    }
}
