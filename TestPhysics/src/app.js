var HelloWorldLayer = cc.Layer.extend({
    sprite: null,
    space: null,
    body: null,

    ctor: function (space) {
        //////////////////////////////
        // 1. super init first
        this._super();

        var size = cc.winSize;
        this.space = space;
        this.init();

        var mainScene = ccs.load(res.MainScene_json);
        this.addChild(mainScene.node, 1);

        //this._debugNode = new cc.PhysicsDebugNode(this.space);
        //this.addChild(this._debugNode, 10);

        return true;
    },

    init: function () {
        //this._super(cc.color(0, 255, 255, 100));
        this._super();
        //create sprite sheet
        cc.spriteFrameCache.addSpriteFrames(res.running_plist, res.running_png);

        var animation = new cc.Animation();
        animation.retain();
        for (var i = 0; i < 8; i++) {
            var frameName = "runner" + i + ".png";
            var spriteFrame = cc.spriteFrameCache.getSpriteFrame(frameName);
            animation.addSpriteFrame(spriteFrame);
        }

        animation.setDelayPerUnit(0.15);           //set the delay time between two frames
        animation.setRestoreOriginalFrame(false);    //back to the original frame once animation end

        var running_action = new cc.Animate(animation);
        running_action.repeatForever();
        //running_action.setTag("running");
        running_action.retain();

        var elasticity = 1.1, friction = 1;

        this.sprite = new cc.PhysicsSprite("#runner0.png");
        var spriteSize = this.sprite.getContentSize();
        this.body = new cp.Body(10/*mass*/, cp.momentForBox(10, spriteSize.width, spriteSize.height));//Body(Resistance coefficient, )
        this.body.p = cc.p(50, g_physics_height + spriteSize.height * 10);//beginning position
        this.body.applyImpulse(cp.v(3000, -4000), cp.v(0, 0));//(beginning force, rotate)
        this.space.addBody(this.body);

        this.shape = new cp.BoxShape(this.body, spriteSize.width, spriteSize.height);// The size of collision model
        this.shape.setElasticity(1);
        this.shape.setFriction(friction);
        this.space.addShape(this.shape);

        this.sprite.setBody(this.body);
        this.sprite.runAction(running_action);
        //this.sprite.setScale(3);

        this.addChild(this.sprite, 10, 0);

        //this.sprite.runAction(new cc.Sequence(
        //    cc.moveBy(2, cc.p(300, -400)),
        //    cc.moveBy(1, cc.p(-200, -100))
        //));

        //sprite 2
        var sprite_2 = new cc.PhysicsSprite(res.test_png);
        var sprite_2_size = sprite_2.getContentSize();
        var sprite_2_body = new cp.Body(1, cp.momentForBox(1, sprite_2_size.width, sprite_2_size.height));
        sprite_2_body.p = cc.p(50, g_physics_height + spriteSize.height * 7);
        sprite_2_body.applyImpulse(cp.v(0, 0), cp.v(0, 0));
        this.space.addBody(sprite_2_body);

        var sprite_2_shape = new cp.BoxShape(sprite_2_body, sprite_2_size.width, sprite_2_size.height);
        sprite_2_shape.setElasticity(1);
        this.space.addShape(sprite_2_shape);


        sprite_2.setBody(sprite_2_body);
        this.addChild(sprite_2, 3, 53);

        var sprites = [];
        var sprites_body = [];
        var sprites_shape = [];
        var pos_x, pos_y;
        //spriteSize = sprite_2_size;
        for (i = 0; i < 50; i++) {
            sprites[i] = new cc.PhysicsSprite(res.test_png);
            sprites_body[i] = new cp.Body(0.5, cp.momentForBox(10, sprite_2_size.width, sprite_2_size.height));
            pos_x = i < 10 ? (50 + spriteSize.width * i + 10 * i) : ( i < 20 ? (50 + spriteSize.width * (i - 10) + 10 * (i - 10)) : (50 + spriteSize.width * (i - 20) + 10 * (i - 20)));
            pos_y = i < 10 ? (g_physics_height + spriteSize.height * 5) : ( i < 20 ? (g_physics_height + spriteSize.height * 3) : (g_physics_height + spriteSize.height) );
            sprites_body[i].p = cc.p(pos_x, pos_y);
            sprites_body[i].applyImpulse(cp.v(0, 0), cp.v(0, 0));
            this.space.addBody(sprites_body[i]);

            sprites_shape[i] = new cp.BoxShape(sprites_body[i], sprite_2_size.width, sprite_2_size.height);
            sprites_shape[i].setElasticity(elasticity);
            sprites_shape[i].setFriction(friction);
            this.space.addShape(sprites_shape[i]);

            sprites[i].setBody(sprites_body[i]);
            this.addChild(sprites[i] ,4, i);

            sprites[i].setColor(cc.color(Math.random() * 255, Math.random() * 255, Math.random() * 255));
        }


        var listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function (touch, event) {
                cc.log("Touching");
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(touch.getLocation());
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);
                if (cc.rectContainsPoint(rect, locationInNode)) {
                    cc.log("Touch began:" + locationInNode.x + "###" + locationInNode.y);
                    target.opacity = 180;
                    return true;
                }
                return false;
            },
            onTouchMoved: function (touch, event) {
                var target = event.getCurrentTarget();
                var delta = touch.getDelta();
                target.x += delta.x;
                target.y += delta.y;
            },
            onTouchEnded: function (touch, event) {
                var target = event.getCurrentTarget();
                cc.log("Touch ended");
                target.setOpacity(255);
            }
        });

        cc.eventManager.addListener(listener, this.sprite);

        var sprite_static = new cc.Sprite("#runner2.png");
        sprite_static.setPosition(cc.p(cc.visibleRect.center));
        this.addChild(sprite_static, 10, 52);
        cc.eventManager.addListener(listener.clone(), sprite_static);
        sprite_static.setColor(cc.color(0, 255, 0, 1));


    }
});

var HelloWorldScene = cc.Scene.extend({
    space: null,

    // init space of chipmunk
    initPhysics: function () {
        this.space = new cp.Space();
        // Gravity
        this.space.gravity = cp.v(0, 0);
        // set up Walls
        var wallStart = new cp.SegmentShape(this.space.staticBody,
            cp.v(0, g_physics_height),// start point
            cp.v(0, g_physics_height + 800),// MAX INT:4294967295
            10);// thickness of wall
        wallStart.setElasticity(1);
        this.space.addStaticShape(wallStart);
        var wallBottom = new cp.SegmentShape(this.space.staticBody,
            cp.v(0, g_physics_height),// start point
            cp.v(300, g_physics_height),// MAX INT:4294967295
            0);// thickness of wall
        wallBottom.setElasticity(1);
        this.space.addStaticShape(wallBottom);

        var wall_End = new cp.SegmentShape(this.space.staticBody,
            cp.v(300, g_physics_height - 30),
            cp.v(600, g_physics_height + 30),
            10
        );
        this.space.addStaticShape(wall_End);

        var wall_Stop = new cp.SegmentShape(this.space.staticBody,
            cp.v(600, g_physics_height - 30),
            cp.v(600, g_physics_height + 3000),
            10
        );
        wall_Stop.setElasticity(1);
        this.space.addStaticShape(wall_Stop);

        var wall_Top = new cp.SegmentShape(this.space.staticBody,
            cp.v(0, 960),
            cp.v(600, 960),
            10
        );
        wall_Top.setElasticity(1);
        this.space.addStaticShape(wall_Top);
    },

    onEnter: function () {
        this._super();
        this.initPhysics();

        var layer = new HelloWorldLayer(this.space);
        this.addChild(layer);

        this.scheduleUpdate();
    },

    update: function (dt) {
        this.space.step(dt);
    }
});

