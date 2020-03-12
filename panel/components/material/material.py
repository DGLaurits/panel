import param
from panel.pane import WebComponent
from .config import MWC_ICONS

class MaterialButton(WebComponent):
    html = param.String('<mwc-button></mwc-button>')
    attributes_to_watch = param.Dict({"label": "label",
                                      "outlined": "outlined",
                                      "raised": "raised",
                                      "unelevated": "unelevated",
                                      "icon": "icon"
                                     })
    events_to_watch = param.Dict(default={"click": "clicks"})

    label = param.String("standard")
    outlined = param.Boolean(False)
    raised = param.Boolean(False)
    unelevated = param.Boolean(False)
    # Todo: Find out how to allow default=None
    icon = param.ObjectSelector(default="code", objects=MWC_ICONS)
    
    clicks = param.Integer()

    @param.depends("unelevated", watch=True)
    def _handle_unelevated_change(self):
        if self.unelevated:
            self.outlined=False
            self.raised=False 

class MaterialFab(WebComponent):
    html = param.String('<mwc-fab></mwc-fab>')
    attributes_to_watch = param.Dict({"icon" : "icon",
                                     })
                
    icon = param.ObjectSelector(default="code", objects=MWC_ICONS)

    def __init__(self, min_height=20, **params):
        super().__init__(min_height=min_height, **params)

