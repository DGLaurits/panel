from panel.components.wired import RadioButton, CheckBox, Slider, ComboBox
import panel as pn

def test_slider(CustomWebComponent):
    # When/ Then
    slider = Slider(attributes_to_watch={"value": "value"})
    slider.html = '<wired-slider id="slider" value="40.507407407407406" knobradius="15" class="wired-rendered" style="margin: 0px"></wired-slider>'
    assert slider.value == 40.507407407407406

def test_view():
    js = """
<script src="https://unpkg.com/@webcomponents/webcomponentsjs@2.2.7/webcomponents-loader.js"></script>
<script src="https://wiredjs.com/dist/showcase.min.js"></script>
"""
    # <script src="https://unpkg.com/@webcomponents/webcomponentsjs@2.0.0/webcomponents-loader.js"></script>
    # https://wiredjs.com/dist/showcase.min.js
    # pn.config.js_files["webcomponents-loaded"]="https://unpkg.com/@webcomponents/webcomponentsjs@latest/webcomponents-loader.js"
    # pn.config.js_files["wired-button"]="https://unpkg.com/wired-button@1.0.0/lib/wired-button.js"

    radio_button = RadioButton()
    check_box = CheckBox()
    check_box_checked = CheckBox(checked=True)
    slider = Slider()
    combobox = ComboBox()
    # video = Video(height=500)
    return pn.Column(
        pn.pane.HTML(js),
        check_box, pn.Param(check_box, parameters=["html", "checked"]),
        check_box_checked, pn.Param(check_box_checked, parameters=["html", "checked"]),
        radio_button, pn.Param(radio_button, parameters=["html", "checked"]),
        slider, pn.Param(slider, parameters=["html", "value"]),
        combobox, pn.Param(combobox, parameters=["html", "selected"]),
        # video, pn.Param(video.param.html),
    )


if __name__.startswith("bk"):
    pn.config.sizing_mode = "stretch_width"
    test_view().servable()
