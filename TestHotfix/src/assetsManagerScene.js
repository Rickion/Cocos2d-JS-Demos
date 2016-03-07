var failCount = 0;
var maxFailCount = 1;   //最大错误重试次数

/**
 *  Update JS file and images automatically
 */
var AssetsManagerLoaderScene = cc.Scene.extend({
    _am: null,
    _progress: null,
    _percent: 0,
    onEnter: function () {
        this._super();
        if (!cc.sys.isNative) {
            cc.log("HTML version");
            this.loadGame();
            return;
        }

        var layer = new cc.Layer();
        this.addChild(layer);
        this._progress = new cc.LabelTTF.create("Upda---- - %", "Arial", 24);
        this._progress.x = cc.winSize.width / 2;
        this._progress.y = cc.winSize.height / 2 + 50;
        layer.addChild(this._progress);

        var storagePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "./");
        cc.log("storagePath is " + storagePath);
        this._am = new jsb.AssetsManager("res/project.manifest", storagePath);
        this._am.retain();

        if (!this._am.getLocalManifest().isLoaded())
        {
            cc.log("Fail to update assets, step skipped.");
            this.loadGame();
        }
        else {
            var that = this;
            //cc.EventListenerAssetsManager //jsb.EventListenerAssetsManager
            //var listener = cc.EventListenerAssetsManager.create(this._am, function (event) {
            var listener = new jsb.EventListenerAssetsManager(this._am, function (event) {
                switch (event.getEventCode()) {
                    case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                        cc.log("No local manifest file found, skip assets update.");
                        that.loadGame();
                        break;
                    case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                        that._percent = event.getPercent();
                        //cc.log(that._percent + "%  -_-!");
                        var msg = event.getMessage();
                        if (msg) {
                            cc.log(msg);
                        }
                        break;
                    case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                    case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                        cc.log("Fail to download manifest file, update skipped.");
                        that.loadGame();
                        break;
                    case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                        cc.log("ALREADY_UP_TO_DATE.");
                        that.loadGame();
                        break;
                    case jsb.EventAssetsManager.UPDATE_FINISHED:
                        cc.log("Update finished.");
                        that.loadGame();
                        break;
                    case jsb.EventAssetsManager.UPDATE_FAILED:
                        cc.log("Update failed. " + event.getMessage());
                        that.loadGame();
                        /*failCount++;
                        if (failCount < maxFailCount) {
                            that._am.downloadFailedAssets();
                        }
                        else {
                            cc.log("Reach maximum fail count, exit update process");
                            failCount = 0;
                            that.loadGame();
                        }*/
                        break;
                    case jsb.EventAssetsManager.ERROR_UPDATING:
                        cc.log("Asset update error: " + event.getAssetId() + ", " + event.getMessage());
                        that.loadGame();
                        break;
                    case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                        cc.log(event.getMessage());
                        that.loadGame();
                        break;
                    default:
                        cc.log(">>>> default\n");
						//cc.log(event.getEventCode());
						//cc.log("Starting Game");
						//that.loadGame();
                        break;
                }
            });

            cc.eventManager.addListener(listener, 1);
            this._am.update();
            //cc.director.runScene(this);
        }

        this.schedule(this.updateProgress, 0.5);
    },

    loadGame: function () {
        //jsList是jsList.js的变量，记录全部js。
        cc.loader.loadJs("src", "jsList.js", function () {
            cc.loader.loadJs(jsList, function () {
                cc.log("loaded jsList");
                cc.director.runScene(new HelloWorldScene());
            });
        });
    },

    updateProgress: function (dt) {
        this._progress.string = "Updating :" + this._percent + " %";
    },

    onExit: function () {
        this._super();
        cc.log(">>>> AssetsManager::onExit");

        //if (this._am != null)
         //   this._am.release();
    }
	
});