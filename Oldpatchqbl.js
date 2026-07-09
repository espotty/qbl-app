if (ObjC.available) {
    try {
        console.log("[*] Key-Bypass script loaded 🚀");

        // تعريف الكلاسات الرئيسية في بداية السكريبت
        var LoginVC = ObjC.classes.LoginViewController;
        var HackVC = ObjC.classes.HackViewController;
        var ViewController = ObjC.classes.ViewController;
        var KeyChain = ObjC.classes.UICKeyChainStore;
        var UIAlertController = ObjC.classes.UIAlertController;

        // 1️⃣ Block any key/update alert
        if (UIAlertController) {
            var alertMaker = UIAlertController["+ alertControllerWithTitle:message:preferredStyle:"];
            Interceptor.attach(alertMaker.implementation, {
                onEnter: function (args) {
                    var msg = ObjC.Object(args[3]).toString().toLowerCase();
                    if (msg.indexOf("key") >= 0 || msg.indexOf("update") >= 0) {
                        console.log("[🚫] Blocking login/update alert");
                        this.block = true;
                    }
                },
                onLeave: function (retval) {
                    if (this.block) {
                        var okStr = ObjC.classes.NSString.stringWithString_("Success ✅");
                        var msgStr = ObjC.classes.NSString.stringWithString_("Logged-in successfully.");
                        var fake = UIAlertController.alertControllerWithTitle_message_preferredStyle_(okStr, msgStr, 1);
                        var okAct = ObjC.classes.UIAlertAction.actionWithTitle_style_handler_("OK", 0, NULL);
                        fake.addAction_(okAct);
                        retval.replace(ptr(fake.handle));
                    }
                }
            });
        }

        // 2️⃣ Force validateKey* to succeed
        if (LoginVC && LoginVC["- validateKeyWithServer:"]) {
            Interceptor.attach(LoginVC["- validateKeyWithServer:"].implementation, {
                onEnter: function (args) {
                    console.log("[+] Bypassing validateKeyWithServer → forced success");
                },
                onLeave: function (retval) {
                    // void method – do nothing
                }
            });
        }

        // 3️⃣ Fake keychain return
        if (KeyChain && KeyChain["+ stringForKey:"]) {
            Interceptor.attach(KeyChain["+ stringForKey:"].implementation, {
                onLeave: function (retval) {
                    if (retval.isNull()) {
                        var fakeKey = ObjC.classes.NSString.stringWithString_("OWNER-LICENSE-KEY-1337");
                        retval.replace(ptr(fakeKey.handle));
                        console.log("[+] Faked keychain return → " + fakeKey);
                    }
                }
            });
        }

        // 4️⃣ Skip LoginViewController completely
        var hackInstance = null;
        if (LoginVC && LoginVC["- viewDidAppear:"]) {
            Interceptor.attach(LoginVC["- viewDidAppear:"].implementation, {
                onEnter: function (args) {
                    var self = new ObjC.Object(args[0]);

                    // dismiss immediately
                    self.dismissViewControllerAnimated_completion_(true, NULL);
                    console.log("[+] Dismissed LoginViewController immediately");

                    // replace root window with HackViewController
                    if (HackVC && !hackInstance) {
                        hackInstance = HackVC.alloc().init();
                        var window = ObjC.classes.UIApplication.sharedApplication().keyWindow();
                        if (window) {
                            window.setRootViewController_(hackInstance);
                            console.log("[+] Set HackViewController as root 🎯");
                        }
                    }
                }
            });
        }

        console.log("[*] Key-Bypass hooks installed ✅");
    } catch (e) {
        console.log("Hook error: " + e);
    }
} else {
    console.log("❌ ObjC runtime not available");
}