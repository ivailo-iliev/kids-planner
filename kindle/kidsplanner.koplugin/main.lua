local Blitbuffer = require("ffi/blitbuffer")
local ButtonTable = require("ui/widget/buttontable")
local CenterContainer = require("ui/widget/container/centercontainer")
local Device = require("device")
local Font = require("ui/font")
local FocusManager = require("ui/widget/focusmanager")
local FrameContainer = require("ui/widget/container/framecontainer")
local Geom = require("ui/geometry")
local Screen = Device.screen
local Size = require("ui/size")
local TextWidget = require("ui/widget/textwidget")
local UIManager = require("ui/uimanager")
local VerticalGroup = require("ui/widget/verticalgroup")
local WidgetContainer = require("ui/widget/container/widgetcontainer")
local _ = require("gettext")

local KidsPlannerPage = FocusManager:extend{}

function KidsPlannerPage:init()
    self.layout = {}

    local screen_size = Screen:getSize()
    local padding = Size.padding.large
    local content_width = screen_size.w - 2 * padding
    local content_height = screen_size.h - 2 * padding

    local buttons = ButtonTable:new{
        width = content_width,
        zero_sep = true,
        buttons = {{
            {
                text = _("Exit"),
                callback = function()
                    self:onClose()
                end,
            },
        }},
        show_parent = self,
    }
    self:mergeLayoutInVertical(buttons)

    local title = TextWidget:new{
        text = _("Kids Planner"),
        face = Font:getFace("tfont"),
        max_width = content_width,
        padding = 0,
    }

    local title_area_height = math.max(0, content_height - buttons:getSize().h)
    local title_area = CenterContainer:new{
        dimen = Geom:new{
            w = content_width,
            h = title_area_height,
        },
        title,
    }

    self.covers_fullscreen = true
    self[1] = FrameContainer:new{
        padding = padding,
        bordersize = 0,
        background = Blitbuffer.COLOR_WHITE,
        VerticalGroup:new{
            title_area,
            buttons,
        },
    }

    self:refocusWidget()
end

function KidsPlannerPage:onClose()
    UIManager:close(self)
    return true
end

function KidsPlannerPage:onCloseWidget()
    if self[1] and self[1].dimen then
        UIManager:setDirty(nil, function()
            return "ui", self[1].dimen
        end)
    end
end

local KidsPlanner = WidgetContainer:extend{
    name = "kidsplanner",
    is_doc_only = false,
}

function KidsPlanner:init()
    self.ui.menu:registerToMainMenu(self)
end

function KidsPlanner:addToMainMenu(menu_items)
    menu_items.kidsplanner = {
        text = _("Kids Planner"),
        sorting_hint = "more_tools",
        callback = function()
            UIManager:show(KidsPlannerPage:new{})
        end,
    }
end

return KidsPlanner
